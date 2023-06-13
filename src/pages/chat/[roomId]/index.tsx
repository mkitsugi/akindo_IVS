import { Flex, Input, Spacer, Text } from "@chakra-ui/react";
import { ChevronLeftIcon, HamburgerIcon } from "@chakra-ui/icons";
import { BiPaperPlane } from "react-icons/bi";

import { useRouter } from "next/router";
import { getUser } from "@/components/models/user";
import { createChat, getChat, getChats } from "@/components/models/chat";
import { Message } from "@/components/chat/message";
import { useState } from "react";
import { ChatType } from "@/types/chat/chatType";
import { uuid } from "uuidv4";

const Index = () => {
  const router = useRouter();
  const roomId =
    typeof router.query.roomId === "string" ? router.query.roomId : "";
  const receiverId =
    typeof router.query.receiverId === "string" ? router.query.receiverId : "";

  const [text, setText] = useState<string>("");

  // Todo ここでreceiverIdからuserInfoを取得する
  const userInfo = getUser(receiverId);

  // Todo ここでroomIdからmessageを取得する
  const messages = getChats(roomId);

  // Todo AIの最初のメッセージ
  const message = getChat("chatId");

  const handleSubmit = async () => {
    // Todo ここで送信処理をする
    try {
      const chatInfo: ChatType = {
        chatId: uuid(),
        chatRoomId: roomId,
        senderId: userInfo.id,
        receiverId: receiverId,
        message: text,
        createdAt: new Date().getTime(),
      };
      createChat(chatInfo);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Flex direction={"column"} py="2rem" minH={"800px"}>
      <Flex alignItems={"center"} justifyContent={"space-between"} px="1rem">
        <Text
          onClick={() => {
            router.back();
          }}
        >
          <ChevronLeftIcon fontSize={"40px"} />
        </Text>

        <Text fontSize={"20px"} fontWeight={"semibold"}>
          {userInfo.userName}
        </Text>

        <Text fontWeight={"bold"}>
          <HamburgerIcon />
        </Text>
      </Flex>

      <Flex direction={"column"} gap={7} mt={"2rem"}>
        <Message key={message.chatId} chat={message} isSender={true} />
        {messages.map((message) => {
          return <Message key={message.chatId} chat={message} />;
        })}
      </Flex>

      <Spacer />

      <Flex gap={"5"} mx="1rem">
        <Input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          bgColor={"white"}
        />
        <Text
          cursor={"pointer"}
          w={"50px"}
          bgColor={"#EF7C76"}
          borderRadius={"full"}
          color={"white"}
          pt=".3rem"
          pl=".4rem"
          shadow={"sm"}
          onClick={handleSubmit}
        >
          <BiPaperPlane size={"28px"} />
        </Text>
      </Flex>
    </Flex>
  );
};
export default Index;
