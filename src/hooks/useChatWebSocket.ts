import { useEffect, useRef, useState, useCallback } from "react";
import { getAccessToken } from "@/lib/token";

export interface ReplyToMessage {
  id: string;
  message: string;
  sender_id: string;
  message_type: string;
  audio_duration?: number;
}

export interface ExtendedChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: "TEXT" | "IMAGE" | "FILE" | "VIDEO" | "AUDIO";
  attachment?: string | null;
  audio_duration?: number;
  reply_to?: ReplyToMessage | null;
  is_read: boolean;
  is_delivered?: boolean;
  is_deleted: boolean;
  is_edited: boolean;
  created_at: string;
  edited_at?: string | null;
  reactions?: Record<string, string>;
  status?: "sent" | "delivered" | "read";
}

export interface PinnedMessageData {
  id: string;
  message_id: string;
  message: string;
  sender_id: string;
  message_type: string;
  attachment?: string | null;
  pinned_by: string;
  pinned_at: string;
}

interface UseChatWebSocketProps {
  roomId: string | null;
  currentUserId: string;
  partnerUserId?: string | null;
  onMessageReceived?: (msg: ExtendedChatMessage) => void;
  onPresenceChanged?: (userId: string, isOnline: boolean) => void;
}

export const useChatWebSocket = ({
  roomId,
  currentUserId,
  partnerUserId,
  onMessageReceived,
  onPresenceChanged,
}: UseChatWebSocketProps) => {
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>({});
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [pinnedMessage, setPinnedMessage] = useState<PinnedMessageData | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Derive partner presence
  const partnerPresence =
    partnerUserId && presenceMap[partnerUserId.toLowerCase()] !== undefined
      ? presenceMap[partnerUserId.toLowerCase()]
      : false;

  // Refs for persistent state access inside WebSocket handlers
  const currentUserIdRef = useRef(currentUserId);
  const partnerPresenceRef = useRef(partnerPresence);
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onPresenceChangedRef = useRef(onPresenceChanged);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  useEffect(() => {
    partnerPresenceRef.current = partnerPresence;
  }, [partnerPresence]);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
    onPresenceChangedRef.current = onPresenceChanged;
  }, [onMessageReceived, onPresenceChanged]);

  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const closeSocket = (reason = "Cleanup") => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      if (ws.current) {
        ws.current.close(1000, reason);
        ws.current = null;
      }
    };

    const connect = () => {
      const token = getAccessToken();

      if (!token) {
        closeSocket("No auth token");
        return;
      }

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close(1000, "Reconnecting with fresh auth token");
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = process.env.NEXT_PUBLIC_WS_HOST || "localhost:8000";
      const socketUrl = `${protocol}//${host}/ws/chat/room/${roomId}/?token=${encodeURIComponent(
        token
      )}`;

      const socket = new WebSocket(socketUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log(`[WS] Connected to room: ${roomId}`);

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ event: "ping" }));
          }
        }, 25000);
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          const eventType = String(
            payload.event || payload.type || payload.action || ""
          ).toLowerCase();

          if (eventType === "pong") return;

          const data = payload.data || payload;

          const eventUserId = String(
            data.user_id ||
              payload.user_id ||
              data.sender_id ||
              data.reader_id ||
              ""
          ).toLowerCase();

          // -------------------------------------------------------------
          // 1. PRESENCE EVENT
          // -------------------------------------------------------------
          if (
            eventType === "presence" ||
            eventType === "presence_event" ||
            eventType.includes("status")
          ) {
            const rawStatus = String(
              data.status || payload.status || "offline"
            ).toLowerCase();
            const isOnline = rawStatus === "online";

            if (eventUserId) {
              setPresenceMap((prev) => ({
                ...prev,
                [eventUserId]: isOnline,
              }));

              onPresenceChangedRef.current?.(eventUserId, isOnline);

              // Upgrade all unread "sent" messages to "delivered" when partner comes online
              if (isOnline) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.status === "sent" && !msg.is_read
                      ? { ...msg, status: "delivered", is_delivered: true }
                      : msg
                  )
                );
              }
            }
            return;
          }

          // -------------------------------------------------------------
          // 2. MESSAGE EVENT
          // -------------------------------------------------------------
          if (eventType === "message" || eventType === "chat_message") {
            const msgData =
              typeof data.message === "object" && data.message !== null
                ? data.message
                : data;

            const messageContent =
              typeof data.message === "string"
                ? data.message
                : msgData.message || "";

            const senderId = String(msgData.sender_id || msgData.sender || "");
            const isMe =
              senderId.toLowerCase() ===
              String(currentUserIdRef.current).toLowerCase();

            // Calculate status based on read state and active presence
            let messageStatus: "sent" | "delivered" | "read" = "sent";
            if (msgData.is_read) {
              messageStatus = "read";
            } else if (msgData.is_delivered || (isMe && partnerPresenceRef.current)) {
              messageStatus = "delivered";
            }

            const newMsg: ExtendedChatMessage = {
              id: String(msgData.id),
              room_id: String(msgData.room_id || msgData.room || roomId),
              sender_id: senderId,
              receiver_id: String(msgData.receiver_id || msgData.receiver || ""),
              message: msgData.is_deleted ? "" : messageContent,
              message_type: msgData.message_type || "TEXT",
              attachment: msgData.is_deleted ? null : msgData.attachment ?? null,
              audio_duration: msgData.audio_duration ?? 0,
              reply_to: msgData.reply_to ?? null,
              is_read: Boolean(msgData.is_read),
              is_delivered: Boolean(msgData.is_delivered || messageStatus === "delivered"),
              is_deleted: Boolean(msgData.is_deleted),
              is_edited: Boolean(msgData.is_edited),
              created_at: msgData.created_at || new Date().toISOString(),
              edited_at: msgData.edited_at ?? null,
              status: messageStatus,
            };

            setMessages((prev) => {
              const existingIndex = prev.findIndex(
                (m) =>
                  String(m.id) === String(newMsg.id) ||
                  (m.id.startsWith("temp-") &&
                    m.message === newMsg.message &&
                    String(m.sender_id).toLowerCase() ===
                      newMsg.sender_id.toLowerCase())
              );

              if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = newMsg;
                return updated;
              }
              return [...prev, newMsg];
            });

            onMessageReceivedRef.current?.(newMsg);
            return;
          }

          // -------------------------------------------------------------
          // 3. EDIT / DELETE / TYPING / READ / DELIVERED RECEIPTS
          // -------------------------------------------------------------
          if (eventType === "edit_message") {
            const msgId = String(data.message_id || data.id);
            setMessages((prev) =>
              prev.map((msg) =>
                String(msg.id) === msgId
                  ? {
                      ...msg,
                      message: data.message,
                      is_edited: true,
                      edited_at: data.updated_at || data.edited_at,
                    }
                  : msg
              )
            );
            return;
          }

          if (eventType === "delete_message") {
            const msgId = String(data.message_id || data.id);
            setMessages((prev) =>
              prev.map((msg) =>
                String(msg.id) === msgId
                  ? {
                      ...msg,
                      is_deleted: true,
                      message: "",
                      attachment: null,
                    }
                  : msg
              )
            );
            return;
          }

          if (eventType === "typing") {
            if (eventUserId !== String(currentUserIdRef.current).toLowerCase()) {
              setIsTyping(Boolean(data.is_typing));
            }
            return;
          }

          if (eventType === "read_receipt") {
            const messageIds: string[] = (data.message_ids || []).map(String);
            setMessages((prev) =>
              prev.map((msg) =>
                messageIds.includes(String(msg.id))
                  ? { ...msg, is_read: true, status: "read" }
                  : msg
              )
            );
            return;
          }

          if (eventType === "delivered") {
            const msgId = String(data.message_id);
            setMessages((prev) =>
              prev.map((msg) =>
                String(msg.id) === msgId && msg.status !== "read"
                  ? { ...msg, is_delivered: true, status: "delivered" }
                  : msg
              )
            );
            return;
          }

          if (eventType === "unread_count") {
            setUnreadCount(Number(data.count || 0));
            return;
          }

          if (eventType === "pin_message") {
            setPinnedMessage(data);
            return;
          }

          if (eventType === "unpin_message") {
            setPinnedMessage(null);
            return;
          }
        } catch (err) {
          console.error("[WS] Error parsing message:", err);
        }
      };

      socket.onerror = (err) => console.error("[WS] Socket error:", err);

      socket.onclose = (e) => {
        console.warn(`[WS] Connection closed with code: ${e.code}`);

        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        if (e.code === 4003 || e.code === 4001 || e.code === 4000) {
          console.error("[WS] Authentication or permission failure. Stopping reconnects.");
          return;
        }

        if (isMounted && e.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isMounted = false;
      const typingTimeout = typingTimeoutRef.current;
      if (typingTimeout) clearTimeout(typingTimeout);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      closeSocket("Unmounted");
    };
  }, [roomId, currentUserId]);

  // Actions
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
      const isOnline = partnerPresenceRef.current;

      const optimisticMsg: ExtendedChatMessage = {
        id: tempId,
        room_id: String(roomId || ""),
        sender_id: String(activeUserId),
        receiver_id: "",
        message: text,
        message_type: messageType,
        attachment: attachmentUrl,
        audio_duration: audioDuration,
        reply_to: replyToId ? { id: replyToId, message: "", sender_id: "", message_type: "TEXT" } : null,
        is_read: false,
        is_delivered: isOnline,
        is_deleted: false,
        is_edited: false,
        created_at: new Date().toISOString(),
        status: isOnline ? "delivered" : "sent",
      };

      setMessages((prev) => [...prev, optimisticMsg]);

      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(
          JSON.stringify({
            event: "message",
            data: {
              message: text,
              message_type: messageType,
              attachment: attachmentUrl,
              reply_to: replyToId,
              audio_duration: audioDuration,
            },
          })
        );
      }
    },
    [roomId]
  );

  const sendTyping = useCallback((isTypingStatus: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          event: "typing",
          data: { is_typing: isTypingStatus },
        })
      );
    }
  }, []);

  const editMessage = useCallback((messageId: string, newText: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        String(msg.id) === String(messageId) ? { ...msg, message: newText, is_edited: true } : msg
      )
    );

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          event: "edit_message",
          data: { message_id: messageId, message: newText },
        })
      );
    }
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        String(msg.id) === String(messageId)
          ? {
              ...msg,
              is_deleted: true,
              message: "",
              attachment: null,
            }
          : msg
      )
    );

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(
        JSON.stringify({
          event: "delete_message",
          data: {
            message_id: messageId,
          },
        })
      );
    }
  }, []);

  return {
    messages,
    setMessages,
    isTyping,
    partnerPresence,
    presenceMap,
    unreadCount,
    pinnedMessage,
    sendMessage,
    sendTyping,
    editMessage,
    deleteMessage,
  };
};