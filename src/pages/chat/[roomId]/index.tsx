import { Flex, Input, Spacer, Text, Box, Container } from "@chakra-ui/react";
import { ChevronLeftIcon, HamburgerIcon } from "@chakra-ui/icons";
import { BiPaperPlane } from "react-icons/bi";
import axios from 'axios';
import { useRouter } from "next/router";
import { getAI } from "@/components/models/ai";
import { getUser } from "@/components/models/user";
import { createChat, getChats } from "@/components/models/chat";
import { Message } from "@/components/chat/message";
import { useState } from "react";
import { ChatType } from "@/types/chat/chatType";
import { uuid } from "uuidv4";
import { useWindowHeight } from '@/hooks/useWindow';

const Index = () => {
  const router = useRouter();

  const windowHeight = useWindowHeight();

  const [isInputFocused, setInputFocus] = useState(false);

  const roomId =
    typeof router.query.roomId === "string" ? router.query.roomId : "";

  const receiverId =
    typeof router.query.receiverId === "string" ? router.query.receiverId : "";

  const [text, setText] = useState<string>("");

  // メッセージ配列の状態を管理
  const [messages, setMessages] = useState<Array<ChatType>>(getChats(roomId));

  // Todo ここでreceiverIdからuserInfoを取得する
  const userInfo = getUser("1");
  const aiInfo = getAI("1");

  // Todo AIの最初のメッセージ
  // const message = getChat("chatId");

  const handleSubmit = async () => {
    try {

      // Clear the input field
      setText('');

      console.log("userInfoId",userInfo.id)
      console.log("recId",receiverId)
      console.log("AIInfo",aiInfo.id)
      // User message
      const chatInfo: ChatType = {
        chatId: uuid(),
        chatRoomId: roomId,
        senderId: userInfo.id,
        receiverId: receiverId,
        message: text,
        createdAt: new Date().getTime(),
      };
      createChat(chatInfo);
      setMessages([...messages, chatInfo]);  // メッセージ配列に新しいユーザーメッセージを追加
  
      // AI response
      const aiMessage = await sendToAI(text);
      const aiChatInfo: ChatType = {
        chatId: uuid(),
        chatRoomId: roomId,
        senderId: "20",  // AI is considered as the receiver
        receiverId: userInfo.id,
        message: aiMessage,
        createdAt: new Date().getTime(),
      };
      createChat(aiChatInfo);
      setMessages([...messages, chatInfo, aiChatInfo]);  // メッセージ配列に新しいAIメッセージを追加
  
     
    } catch (e) {
      console.error(e);
    }
  };

  const sendToAI = async (message: string) => {
    try {
      const response = await axios.post('/api/chat_gptResponse', { message });
      console.log('API Response:', response);  // APIのレスポンスを確認
      return response.data;
    } catch (e) {
      console.error('API Error:', e);  // APIからのエラーを確認
    }
  };

  return (
    <Flex direction={"column"} py="1rem" h={isInputFocused ?  `${windowHeight}px` : `${windowHeight}px`} overflow={"hidden"}>
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

      <Flex direction={"column"} gap={5} mt={"0rem"} mb={"1rem"} overflowY="scroll" flexGrow={1} >
        {/* <Message key={message.chatId} chat={message} isSender={true} /> */}
        {messages.map((message) => {
          const isUserMessage = message.senderId !== userInfo.id;  // Check if the message is sent by the user
          return <Message key={message.chatId} chat={message} isSender={isUserMessage} />;
        })}
      </Flex>

      {/* <Spacer /> */}

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
              onFocus={() => setInputFocus(true)}
              onBlur={() => setInputFocus(false)}
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
