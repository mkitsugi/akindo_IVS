// pages/chat/index.tsx
import {
  Box,
  VStack,
  Text,
  Avatar,
  Flex,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  Heading,
  Icon,
  Badge,
} from "@chakra-ui/react";
import { SearchIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { NextPage } from "next";

interface Chat {
  id: number;
  username: string;
  lastMessage: string;
  lastMessageTime: string;
  avatar: string;
  unreadMessages: number;
}

const chats: Chat[] = [
  {
    id: 1,
    username: "初音ミユ",
    lastMessage: "まいちゃん！おつかれ〜！",
    lastMessageTime: "10:00 PM",
    avatar: "images/8.png",
    unreadMessages: 2,
  },
  {
    id: 2,
    username: "安藤あかり",
    lastMessage: "まいちゃん元気？？🥺",
    lastMessageTime: "09:45 PM",
    avatar: "images/3.png",
    unreadMessages: 0,
  },
  // More chats here...
];

const ChatPage: NextPage = () => {
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
        {chats.map((chat) => (
          <Flex key={chat.id} w="100%" align="center">
            <Avatar src={chat.avatar} />
            <Box ml={4} flex={1}>
              <Flex justify="space-between">
                <Flex align="center">
                  <Text fontWeight="bold">{chat.username}</Text>
                  <CheckCircleIcon color="blue.400" ml={2} />{" "}
                  {/* Icon added here */}
                </Flex>
                <Text color="gray.500">{chat.lastMessageTime}</Text>
              </Flex>
              <Flex justify="space-between" pt={1}>
                <Text
                  isTruncated // これにより text-overflow: ellipsis が適用されます
                  whiteSpace="nowrap" // テキストを改行させないために必要です
                  overflow="hidden" // これによりテキストが要素のサイズを超えた場合に切り捨てられます
                >
                  {chat.lastMessage}
                </Text>
                {chat.unreadMessages > 0 && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    width="24px"
                    height="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {chat.unreadMessages}
                  </Badge>
                )}
              </Flex>
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default ChatPage;
