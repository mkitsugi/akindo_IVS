// pages/chat/index.tsx
import {
  Box,
  VStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { NextPage } from "next";
import { ChatCard } from "@/components/chat/chatCard";
import { getAI } from "@/components/models/ai";
import { getUser } from "@/components/models/user";
import { getChat } from "@/components/models/chat";

import { UserType } from "@/types/user/userType";

const ChatPage: NextPage = () => {
  // Todo ここでmessageを取得する
  const aiInfo = getAI("1");
  const userInfo = getUser("1");
  const allMessages = [getChat("1")];
  const unreadMessages = 2;


  return (
    <Box p={4} pt={10}>
      <VStack spacing={0}>
        <Text fontSize="2xl" fontWeight="bold" px={6}>
          あなたに
        </Text>
        <Text fontSize="2xl" fontWeight="bold" px={6} mb={6}>
          メッセージが届いています
        </Text>
      </VStack>
      <InputGroup mb={6} bg="white" rounded={20}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input type="search" placeholder="チャットを検索" rounded={20} />
      </InputGroup>

      <VStack spacing={4} divider={<Box h="2px" bg="gray.200" />}>
        {/* AI用のチャット */}
      {allMessages.map((chat, i) => (
          <ChatCard
            key={chat.chatId}
            userInfo={aiInfo}
            lastChat={chat}
            unreadMessages={unreadMessages}
          />
        ))}

        {/* ユーザー用のチャット */}
        {allMessages.map((chat, i) => (
          <ChatCard
            key={chat.chatId}
            userInfo={userInfo}
            lastChat={chat}
            unreadMessages={unreadMessages}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default ChatPage;
