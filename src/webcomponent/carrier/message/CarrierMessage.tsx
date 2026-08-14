"use client";

import { useEffect, useRef, useState, ChangeEvent } from "react";
import { HeadingSection } from "@/webcomponent/reusable/HeadingSection";
import {
  ArrowRight,
  Send,
  Paperclip,
  Loader2,
  Circle,
  Search,
  ChevronLeft,
  Download,
  X,
  FileIcon,
  ImageIcon,
} from "lucide-react";
import { format, isValid } from "date-fns";
import {
  fetchChatRooms,
  fetchChatHistory,
  uploadChatAttachment,
  ChatRoom,
  ChatMessageData,
} from "@/api/chat.api";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";

export const CarrierMessage = () => {
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showMobileChat, setShowMobileChat] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = localStorage.getItem("userId") || "";
      setCurrentUserId(storedUserId);
    }
  }, []);

  const selectedConv = conversations.find((c) => c.id === selectedConvId);
  const partnerUser = selectedConv?.participant || null;

  // Initialize WebSocket Hook
  const {
    messages,
    setMessages,
    isTyping,
    partnerPresence,
    sendMessage,
    handleTyping,
  } = useChatWebSocket({
    roomId: selectedConvId,
    currentUserId,
    onMessageReceived: (newMsg) => {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === newMsg.room_id) {
            return {
              ...conv,
              last_message: newMsg.message || "Sent an attachment",
              last_message_at: newMsg.created_at,
              unread_count:
                conv.id === selectedConvId
                  ? 0
                  : (conv.unread_count || 0) + 1,
            };
          }
          return conv;
        })
      );
    },
  });

  // 1. Fetch Chat Rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        const rooms = await fetchChatRooms();
        setConversations(rooms);
        if (rooms.length > 0 && !selectedConvId) {
          setSelectedConvId(rooms[0].id);
        }
      } catch (err) {
        console.error("Error fetching chat rooms:", err);
      }
    };
    loadRooms();
  }, []);

  // 2. Fetch Chat History
  useEffect(() => {
    if (!selectedConvId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const historyData = await fetchChatHistory(selectedConvId);
        setMessages(historyData.results || []);

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedConvId ? { ...conv, unread_count: 0 } : conv
          )
        );
      } catch (err) {
        console.error("Error fetching chat history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [selectedConvId, setMessages]);

  // 3. Auto Scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatTime = (dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isValid(date) ? format(date, "HH:mm") : "";
  };

  const handleSelectRoom = (roomId: string) => {
    setSelectedConvId(roomId);
    setShowMobileChat(true);
  };

  const handleSend = () => {
    if (!replyText.trim() || !selectedConvId) return;
    sendMessage(replyText.trim());
    setReplyText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConvId) return;

    try {
      setIsUploading(true);
      const uploaded = await uploadChatAttachment(file);
      sendMessage(file.name, uploaded.url, uploaded.file_type || "FILE");
    } catch (err) {
      console.error("Failed to upload attachment:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const name = conv.participant?.full_name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="py-6 px-2 sm:px-6 max-w-[1600px] mx-auto">
      <HeadingSection
        heading="Messages"
        subheading="Communicate securely with senders and travelers in real time."
      />

      <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex h-[calc(100vh-180px)] min-h-[500px]">
        
        {/* ===================== MESSENGER SIDEBAR ===================== */}
        <div
          className={`w-full md:w-[340px] lg:w-[380px] border-r border-gray-200 flex flex-col shrink-0 bg-white transition-all ${
            showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header & Search Bar */}
          <div className="p-3.5 border-b border-gray-100 flex flex-col gap-2.5">
            <h2 className="text-2xl font-bold text-gray-900 px-1 tracking-tight">Chats</h2>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Messenger"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm outline-none focus:bg-gray-200/70 transition"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.participant;
                const isSelected = selectedConvId === conv.id;
                const hasUnread = conv.unread_count > 0;
                const lastMsgText = conv.last_message || "Started a chat";

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectRoom(conv.id)}
                    className={`group cursor-pointer p-2.5 rounded-xl flex items-center gap-3 transition-colors ${
                      isSelected
                        ? "bg-blue-50/80"
                        : "hover:bg-gray-100/80"
                    }`}
                  >
                    {/* Profile Picture with Online Status Indicator */}
                    <div className="relative shrink-0">
                      {partner?.profile_image ? (
                        <img
                          src={partner.profile_image}
                          alt={partner.full_name}
                          className="w-13 h-13 rounded-full object-cover shadow-xs border border-gray-100"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-lg uppercase shadow-xs">
                          {partner?.full_name?.[0] || "U"}
                        </div>
                      )}

                      {/* Messenger Active Dot */}
                      <span
                        className={`w-3.5 h-3.5 absolute bottom-0 right-0 rounded-full border-2 border-white ${
                          partner?.is_online
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      />
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <h4
                          className={`truncate text-sm ${
                            hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-800"
                          }`}
                        >
                          {partner?.full_name || "Unknown User"}
                        </h4>
                        <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <p
                          className={`text-xs truncate ${
                            hasUnread
                              ? "font-bold text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {lastMsgText}
                        </p>

                        {hasUnread && (
                          <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ===================== CHAT MAIN PANEL ===================== */}
        <div
          className={`flex-1 flex flex-col bg-gray-50/50 ${
            !showMobileChat ? "hidden md:flex" : "flex"
          }`}
        >
          {selectedConv && partnerUser ? (
            <>
              {/* Top Header */}
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div className="relative">
                    {partnerUser.profile_image ? (
                      <img
                        src={partnerUser.profile_image}
                        alt={partnerUser.full_name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-semibold uppercase text-base">
                        {partnerUser.full_name?.[0] || "U"}
                      </div>
                    )}
                    <Circle
                      className={`w-3 h-3 absolute bottom-0 right-0 rounded-full border-2 border-white ${
                        partnerPresence === "online" || partnerUser.is_online
                          ? "fill-green-500 text-green-500"
                          : "fill-gray-300 text-gray-300"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">
                      {partnerUser.full_name}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span>
                        {partnerPresence === "online" || partnerUser.is_online
                          ? "Active now"
                          : "Offline"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs ${
                            isMe
                              ? "bg-blue-600 text-white rounded-br-xs"
                              : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                          }`}
                        >
                          {/* Image Attachments */}
                          {msg.attachment && msg.message_type === "IMAGE" && (
                            <div className="mb-2 overflow-hidden rounded-xl">
                              <img
                                src={msg.attachment}
                                alt="Attachment"
                                onClick={() => setPreviewImage(msg.attachment)}
                                className="max-h-60 w-full object-cover cursor-pointer hover:opacity-90 transition"
                              />
                            </div>
                          )}

                          {/* Non-Image Attachments */}
                          {msg.attachment && msg.message_type !== "IMAGE" && (
                            <a
                              href={msg.attachment}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`flex items-center gap-2 p-2 rounded-lg mb-2 text-xs font-medium border ${
                                isMe
                                  ? "bg-blue-700/50 border-blue-500 text-white"
                                  : "bg-gray-50 border-gray-200 text-blue-600"
                              }`}
                            >
                              <FileIcon className="w-4 h-4 shrink-0" />
                              <span className="truncate flex-1">
                                {msg.message || "Download Attachment"}
                              </span>
                              <Download className="w-4 h-4 shrink-0" />
                            </a>
                          )}

                          {/* Message Text */}
                          {msg.message_type === "TEXT" && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {msg.message}
                            </p>
                          )}

                          <span
                            className={`text-[10px] mt-1 block text-right ${
                              isMe ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {formatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-100 w-max px-3 py-1.5 rounded-full shadow-2xs">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                    <span>{partnerUser.full_name} is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Control Bar */}
              <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition disabled:opacity-50 shrink-0"
                >
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  ) : (
                    <Paperclip className="w-5 h-5" />
                  )}
                </button>

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />

                <button
                  onClick={handleSend}
                  disabled={!replyText.trim()}
                  className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-40 shrink-0 shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-gray-700 font-medium text-base mb-1">Your Messages</h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Select a conversation to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
};