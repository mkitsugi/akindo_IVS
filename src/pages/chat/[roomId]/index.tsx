import { Flex, Input, Spacer, Text, Box, Container } from "@chakra-ui/react";
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

  // Todo ここでroomIdからmessageを取得する。
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
    <Flex direction={"column"} py="2rem" minH={"100vh"}>
      <Flex alignItems={"center"} justifyContent={"space-between"} px="1rem" mb="1rem">
        <Box onClick={() => { router.back(); }}>
          <ChevronLeftIcon fontSize={"40px"} />
        </Box>
        <Box>
          <Text fontSize={"20px"} fontWeight={"semibold"}>
            {userInfo.userName}
          </Text>
        </Box>
        <Box>
          <HamburgerIcon fontSize={"28px"} />
        </Box>
      </Flex>

      <Flex direction={"column"} gap={5} my={"1rem"} overflowY="scroll" h="75vh" >
        <Message key={message.chatId} chat={message} isSender={true} />
        {messages.map((message) => {
          return <Message key={message.chatId} chat={message} />;
        })}
      </Flex>

      <Spacer />

      <Container maxW="95%" p={10} padding="0">
        <Flex 
            gap={2}
            p={3}
            alignItems="center"
            bgColor="white"
            borderRadius="lg"
        >
            <Input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
              }}
              placeholder="メッセージを入力してください..."
              border="none"
            />
            <Box
              as="button"
              cursor="pointer"
              w="45px"
              h="40px"
              bgColor="#EF7C76"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={handleSubmit}
              _hover={{ bgColor: "#dd6b63" }}
              _active={{
                transform: "scale(0.95)",
              }}
            >
              <BiPaperPlane color="white" size="20px" />
            </Box>
        </Flex>
      </Container>
    </Flex>
  );
};
export default Index;
