import { ChatType } from "@/types/chat/chatType";
import { demoMessage } from "@/components/mock/demoMessage";
import { ChatRoomType } from "@/types/chat/chatRoomType";
import axios from "axios";
import { useState } from "react";
import { error } from "console";

function mapToChatRoomType(chatRoomData: any): ChatRoomType {
  return {
    chatroomId: chatRoomData.id,
    participants_id: chatRoomData.participants_id,
    createdAt: chatRoomData.createdAt,
  };
}

function mapToChatType(chatData: any): ChatType {
  return {
    chatRoomId: chatData.chat_room_id,
    chatId: chatData.id,
    createdAt: chatData.createdAt,
    user_id: chatData.user_id,
    message: chatData.message,
  };
}

export async function createChat(chat: ChatType): Promise<boolean> {
  try {
    axios.post("/api/createChat", chat).then((res) => {
      console.log("createChat", res.data);
    });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function getChatRoomsByroomId(chatRoomId: string): Promise<ChatRoomType[]> {
  // Todo userIdを元にチャットを取得する
  let data: ChatRoomType[] = [];
  await axios
    .get("/api/getAllMyChatRoomByRoomid", { params: { chatRoomId } })
    .then((res) => {
      console.log("getChatRoom(Single):", res.data);
      data = res.data.map(mapToChatRoomType);
    });
  return data;
}

export async function getChatRooms(userId: string): Promise<ChatRoomType[]> {
  // Todo userIdを元にチャットを取得する
  let data: ChatRoomType[] = [];
  await axios
    .get("/api/getAllMyChatRoomByUserid", { params: { userId } })
    .then((res) => {
      console.log("getChatRooms", res.data);
      data = res.data.map(mapToChatRoomType);
    });
  return data;
}

export async function getSingleChats(chatroomId: string): Promise<ChatType[]> {
  let chatsForRoom: ChatType[] = [];

  if (chatroomId) {
    await axios
      .get("/api/getAllMyChat", {
        params: { chatRoomId: chatroomId },
      })
      .then((res) => {
        console.log("getChatsForRoom-single", res.data);
        chatsForRoom = res.data.map(mapToChatType);
      });
  }

  return chatsForRoom;
}

export async function getMultiChats(
  ChatRooms: ChatRoomType[]
): Promise<ChatType[][]> {
  let data: ChatType[][] = [];
  for (let chatRoom of ChatRooms) {
    if (chatRoom.chatroomId) {
      await axios
        .get("/api/getAllMyChat", {
          params: { chatRoomId: chatRoom.chatroomId },
        })
        .then((res) => {
          console.log("getChats-xxx", res.data);
          const chatsForRoom: ChatType[] = res.data.map(mapToChatType);
          data.push(chatsForRoom);
        });
    }
  }
  return data;
}
