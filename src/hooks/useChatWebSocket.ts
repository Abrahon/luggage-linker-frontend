// src/hooks/useChatWebSocket.ts
import { useEffect, useRef, useState, useCallback } from "react";
import { ChatMessageData } from "@/api/chat.api";

interface UseChatWebSocketProps {
  roomId: string | null;
  currentUserId: string;
  onMessageReceived?: (msg: ChatMessageData) => void;
}

export const useChatWebSocket = ({
  roomId,
  currentUserId,
  onMessageReceived,
}: UseChatWebSocketProps) => {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [partnerPresence, setPartnerPresence] = useState<"online" | "offline">("offline");
  const ws = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref up to date to prevent stale closures in socket callbacks
  const currentUserIdRef = useRef(currentUserId);
  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const connect = () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("token")
          : null;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost:8000";
      const socketUrl = `${protocol}//${host}/ws/chat/room/${roomId}/?token=${encodeURIComponent(
        token || ""
      )}`;

      console.log("Connecting to WebSocket:", socketUrl);
      const socket = new WebSocket(socketUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log(`Connected to chat room: ${roomId}`);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log("WebSocket message received:", payload);

          // Support event names across various backend conventions
          const eventType = (payload.event || payload.type || payload.action || "").toLowerCase();
          const rawData = payload.data || payload.message_data || payload;

          // Process message frames
          if (
            eventType.includes("message") ||
            eventType === "chat" ||
            rawData.message !== undefined ||
            rawData.text !== undefined
          ) {
            const senderId = String(
              rawData.sender_id ??
                rawData.sender?.id ??
                rawData.sender ??
                rawData.user_id ??
                ""
            );

          const replyToObj =
            typeof rawData.reply_to === "object" && rawData.reply_to !== null
              ? (rawData.reply_to as ChatMessageData)
              : null;

          const newMsg: ChatMessageData = {
            id: String(rawData.id || rawData.message_id || `msg-${Date.now()}`),
            room_id: String(rawData.room_id || roomId),
            sender_id: senderId,
            receiver_id: String(rawData.receiver_id || rawData.recipient_id || ""),
            message: rawData.message || rawData.text || "",
            message_type: rawData.message_type || "TEXT",
            attachment: rawData.attachment ?? null,
            audio_duration: rawData.audio_duration ?? 0,
            reply_to: replyToObj, // <--- Updated to match ChatMessageData | null
            is_read: rawData.is_read ?? false,
            is_deleted: rawData.is_deleted ?? false,
            is_edited: Boolean(rawData.is_edited || rawData.edited_at),
            created_at: rawData.created_at || rawData.timestamp || new Date().toISOString(),
          };

            setMessages((prev) => {
              // Replace optimistic temp message or avoid duplicate inserts
              const existingIndex = prev.findIndex(
                (m) =>
                  String(m.id) === String(newMsg.id) ||
                  (m.id.startsWith("temp-") &&
                    m.message === newMsg.message &&
                    String(m.sender_id) === String(newMsg.sender_id))
              );

              if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = newMsg;
                return updated;
              }
              return [...prev, newMsg];
            });

            onMessageReceived?.(newMsg);
          } else if (eventType.includes("typing")) {
            const typingUserId = String(rawData.user_id || rawData.sender_id || "");
            if (typingUserId !== String(currentUserIdRef.current)) {
              setIsTyping(Boolean(rawData.is_typing ?? rawData.typing));
            }
          } else if (eventType.includes("presence") || eventType.includes("status")) {
            const statusUserId = String(rawData.user_id || rawData.sender_id || "");
            if (statusUserId !== String(currentUserIdRef.current)) {
              setPartnerPresence(rawData.status === "online" ? "online" : "offline");
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
      };

      socket.onclose = (event) => {
        console.log(`WebSocket closed for room ${roomId}. Code: ${event.code}`);
        // Reconnect automatically if closed unexpectedly
        if (isMounted && event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (ws.current) {
        ws.current.close(1000, "Unmounted");
      }
    };
  }, [roomId, onMessageReceived]);

  // Send message with INSTANT Optimistic Local Update
  const sendMessage = useCallback(
    (
      text: string,
      attachmentUrl: string | null = null,
      messageType: "TEXT" | "IMAGE" | "FILE" | "VIDEO" | "AUDIO" = "TEXT",
      replyToId: string | null = null,
      audioDuration: number = 0
    ) => {
      const activeUserId = currentUserIdRef.current;
      const tempId = `temp-${Date.now()}`;

      // 1. OPTIMISTIC UPDATE: Append immediately to local state
      const optimisticMsg: ChatMessageData = {
        id: tempId,
        room_id: String(roomId || ""),
        sender_id: String(activeUserId),
        receiver_id: "",
        message: text,
        message_type: messageType,
        attachment: attachmentUrl,
        audio_duration: audioDuration,
        reply_to: null,
        is_read: false,
        is_deleted: false,
        is_edited: false,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      // 2. Transmit through WebSocket connection
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const payload = {
          event: "message",
          data: {
            message: text,
            message_type: messageType,
            attachment: attachmentUrl,
            reply_to: replyToId,
            audio_duration: audioDuration,
          },
        };
        console.log("Sending WebSocket message:", payload);
        ws.current.send(JSON.stringify(payload));
      } else {
        console.warn("WebSocket not connected. Message rendered optimistically.");
      }
    },
    [roomId]
  );

  const handleTyping = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          event: "typing",
          data: { is_typing: true },
        })
      );

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({
              event: "typing",
              data: { is_typing: false },
            })
          );
        }
      }, 2000);
    }
  }, []);

  return {
    messages,
    setMessages,
    isTyping,
    partnerPresence,
    sendMessage,
    handleTyping,
  };
};