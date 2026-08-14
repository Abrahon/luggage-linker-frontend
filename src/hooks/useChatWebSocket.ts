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

  useEffect(() => {
    if (!roomId) return;

    // Build absolute WebSocket URL pointing to your backend
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.host;
    const socketUrl = `${protocol}//${host}/ws/chat/room/${roomId}/`;

    const socket = new WebSocket(socketUrl);
    ws.current = socket;

    socket.onopen = () => {
      console.log(`Connected to chat room: ${roomId}`);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "chat_message":
          case "message": {
            const newMsg: ChatMessageData = data.message || data;
            setMessages((prev) => [...prev, newMsg]);
            if (onMessageReceived) onMessageReceived(newMsg);
            break;
          }
          case "typing_status": {
            if (data.user_id !== currentUserId) {
              setIsTyping(data.is_typing);
            }
            break;
          }
          case "user_presence": {
            if (data.user_id !== currentUserId) {
              setPartnerPresence(data.status);
            }
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };

    socket.onclose = () => {
      console.log(`Closed WebSocket connection for room: ${roomId}`);
    };

    return () => {
      socket.close();
    };
  }, [roomId, currentUserId, onMessageReceived]);

  // Dispatch text or attachment payloads
  const sendMessage = useCallback(
    (
      text: string,
      attachmentUrl: string | null = null,
      messageType: "TEXT" | "IMAGE" | "FILE" | "VIDEO" | "AUDIO" = "TEXT",
      replyToId: string | null = null
    ) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const payload = {
          action: "send_message",
          message: text,
          message_type: messageType,
          attachment: attachmentUrl,
          reply_to_id: replyToId,
        };
        ws.current.send(JSON.stringify(payload));
      }
    },
    []
  );

  // Broadcast typing status with auto-clearing debounce
  const handleTyping = useCallback(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({ action: "typing", is_typing: true })
      );

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(
            JSON.stringify({ action: "typing", is_typing: false })
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