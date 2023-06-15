import { ChatType } from "@/types/chat/chatType";
import { demoMessage } from "@/components/mock/demoMessage";
import { ChatRoomType } from "@/types/chat/chatRoomType";
import axios from "axios";
import { useState } from "react";

export function createChat(chat: Omit<ChatType, "createdAt">): ChatType {
  // Todo chatを作成する. azureに保存する
  return {
    ...chat,
    createdAt: Date.now(),
  };
}

export function getChat(id: string): ChatType {
  // Todo idを元にチャットを取得する
  return {
    chatId: id,
    senderId: "550e8400-e29b-41d4-a716-446655440000",
    receiverId: "550e8400-e29b-41d4-a716-446655440001",
    chatRoomId: "570e8400-e39b-86d4-a246-446656428202",
    message: "やっほー",
    createdAt: 1686582000000,
  };
}

export function getChats(userId: string): ChatRoomType[] {
  // Todo userIdを元にチャットを取得する
  let data: ChatRoomType[] = [];
  axios.get("/api/getAllMyChatRoom", { params: { userId } }).then((res) => {
    console.log(res.data);
    data = res.data;
  });
  return data;
}
