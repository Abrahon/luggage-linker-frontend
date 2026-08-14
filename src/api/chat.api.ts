// src/api/chat.api.ts
// src/api/chat.api.ts
import axiosInstance from "@/api/axios";

export interface Participant {
  id: string;
  full_name: string;
  profile_image: string | null;
  is_online: boolean;
  last_seen: string | null;
}

export interface ChatRoom {
  id: string;
  booking: string | null;
  participant: Participant;
  last_message: string;
  last_message_type: string | null;
  last_message_sender: string | null;
  last_message_at: string | null;
  is_active: boolean;
  unread_count: number;
  created_at: string;
  updated_at: string;
  userfrom?: string;
  userto?: string;
}

export interface ChatMessageData {
  id: string;
  room_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: "TEXT" | "IMAGE" | "FILE" | "VIDEO" | "AUDIO" | "SYSTEM";
  attachment: string | null;
  is_read: boolean;
  is_deleted: boolean;
  is_edited: boolean;
  created_at: string;
  audio_duration?: number;
  reply_to?: ChatMessageData | null;
}

// Fetch Chat Rooms
export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await axiosInstance.get("/api/chat/rooms/");
  // Handles Django REST Framework paginated response ({ results: [...] }) or direct arrays
  return response.data.results || response.data;
};

// Fetch Chat History
export const fetchChatHistory = async (
  roomId: string,
  page = 1
): Promise<{ results: ChatMessageData[] }> => {
  const response = await axiosInstance.get(
    `/api/chat/rooms/${roomId}/messages/?page=${page}`
  );
  if (Array.isArray(response.data)) {
    return { results: response.data };
  }
  return response.data;
};

// Upload File Attachment
export const uploadChatAttachment = async (
  file: File
): Promise<{ url: string; file_type: "IMAGE" | "FILE" | "VIDEO" | "AUDIO" }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post("/api/chat/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 4. Global Message Search across conversations
export const searchMessages = async (
  query: string
): Promise<ChatMessageData[]> => {
  const response = await axiosInstance.get(
    `api//messages/search/?q=${encodeURIComponent(query)}`
  );
  return response.data.results || response.data;
};