// pages/chat/index.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  VStack,
  Spacer,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Slide,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  useTheme,
  HStack,
} from "@chakra-ui/react";

import {
  SearchIcon,
  HamburgerIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from "@chakra-ui/icons";
import { NextPage } from "next";
import { ChatCard } from "@/components/chat/chatCard";
import { getAI } from "@/components/models/ai";
import { getUser } from "@/components/models/user";
import { getChatRooms, getMultiChats } from "@/components/models/chat";
import { UserType } from "@/types/user/userType";
import { ChatType } from "@/types/chat/chatType";
import { ChatRoomType } from "@/types/chat/chatRoomType";
import { User } from "@azure/cosmos";

const ChatPage: NextPage = () => {
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [chatrooms, setChatrooms] = useState<ChatRoomType[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  //他のユーザー情報を格納するためのものです。
  const [otherUsers, setOtherUsers] = useState<UserType[] | undefined>([]);

  const unreadMessages = 2; //unreadMessagesは最悪DBとは連携させない

  //ハンバーガーアイコンの挙動
  const { isOpen, onOpen, onClose } = useDisclosure();

  // トグル状態の管理
  const [showAdvanced, setShowAdvanced] = useState(false);
  const handleToggle = () => setShowAdvanced(!showAdvanced);

  useEffect(() => {
    const data = localStorage.getItem("user");
    // データがnullではない場合、それをパースします
    if (data !== null) {
      setUserInfo(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    if (!userInfo) return;
    getChatRooms(userInfo.id).then(setChatrooms);
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo || !chatrooms.length) return;
    getMultiChats(chatrooms).then((chatArrays) => {
      // Flatten the array of chat arrays into a single array
      const allChats = chatArrays.reduce((acc, chats) => [...acc, ...chats], []);
      // Sort the chats by createdAt timestamp in descending order
      allChats.sort((a, b) => b.createdAt - a.createdAt);
      setChats(allChats);
    });
  }, [userInfo, chatrooms]);

  // useStateを使って各チャットルームのユーザー情報を保持するステートを作成
const [chatroomUsers, setChatroomUsers] = useState<Map<string, UserType[]>>(new Map());

useEffect(() => {
    if (!userInfo || !chatrooms.length) return;

    const otherUserIds = chatrooms.map(room => {
      if (room && Array.isArray(room.participants_id)) {
        const otherIds = room.participants_id.filter(id => id !== userInfo.id);
        return { chatroomId: room.chatroomId, otherIds };
      }
      return null;
    }).filter(item => item !== null);

    Promise.all(
      otherUserIds.filter((item): item is { chatroomId: string; otherIds: string[]; } => item !== null).map(({ chatroomId, otherIds }) =>
    Promise.all(otherIds.map((id: string) => getUser(id) as Promise<UserType>)).then(users => ({
      chatroomId,
      users: users.filter((user): user is UserType => user !== null && user !== undefined),
    }))
  )
    ).then(chatroomAndUsers => {
      const newChatroomUsers = new Map();
      for (const { chatroomId, users } of chatroomAndUsers) {
        newChatroomUsers.set(chatroomId, users);
      }
      setChatroomUsers(newChatroomUsers);
    });
  }, [userInfo, chatrooms]);

  
  // useEffect(() => {
  //   if (!userInfo || !chatrooms.length) return;

  //   const otherUserIds = chatrooms.map(room => {
  //     if (room && Array.isArray(room.participants_id)) {
  //       const otherIds =room.participants_id.filter(id => id !== userInfo.id);
  //       return otherIds;
  //     }
  //     return [];
  //   }).filter(Boolean);

  //   Promise.all(otherUserIds.flat().map(id => id && getUser(id)))
  //   .then(users => users.filter((user): user is UserType => user !== null && user !== undefined))
  //   .then(setOtherUsers);
  //   console.log("R:", otherUsers);
  // }, [userInfo, chatrooms]);

  if (!userInfo) return <></>;

  return (
    <Box p={4} pt={10}>
      <VStack spacing={0}>
        <HamburgerIcon
          aria-label="Menu"
          fontSize="28px"
          position="absolute"
          right={4}
          top={4}
          onClick={onOpen} // アイコンクリックでメニューバーを開く
        />
        <Text fontSize="2xl" fontWeight="bold" px={6} mt={5}>
          あなたにメッセージ
        </Text>
        <Text fontSize="2xl" fontWeight="bold" px={6} mb={6}>
          が届いています
        </Text>
      </VStack>
      <InputGroup mb={6} bg="white" rounded={20}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input type="search" placeholder="チャットを検索" rounded={20} />
      </InputGroup>

      <VStack spacing={4} divider={<Box h="2px" bg="gray.200" />}>

        {/* ユーザー用のチャット */}
        {chatrooms.map((chatroom, i) => {
          const participantCount = chatroom.participants_id.length;

          const correspondingUser = otherUsers?.flat().find(user => chatroom.participants_id.includes(user.id));
          const usersInChatroom = chatroomUsers.get(chatroom.chatroomId);
          console.log("User:",i, usersInChatroom);
          const chat = chats.find(chat => chat.chatRoomId === chatroom.chatroomId);

          // If no corresponding user or chat is found, don't render the ChatCard
          if (!chat) return null;

          // if (participantCount === 2) {
            return(
            <ChatCard
              key={chatroom.chatroomId}
              userInfo={usersInChatroom}
              ChatRoomInfo={chatroom}
              ChatInfo={chat}
              unreadMessages={unreadMessages}
            />
            );
          // }

          // if (participantCount === 3) {
          //   return(
          //     <ChatCard
          //       key={chatroom.chatroomId}
          //       userInfo={correspondingUser}
          //       ChatRoomInfo={chatroom}
          //       ChatInfo={chat}
          //       unreadMessages={unreadMessages}
          //     />
          //     );
          // }

        })}
      </VStack>

      {/* メニューバーの実装 */}
      <Slide direction="right" in={isOpen} style={{ zIndex: 10 }}>
        <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent position="absolute" right={0} w="30vw" maxW="200px">
            {/* メニューの内容をここに書く */}

            <VStack
              color="black"
              align="start"
              justify="center"
              h="full"
              pl={5}
              spacing={6}
              py={6}
            >
              <Spacer />
              <Text fontWeight="bold" fontSize="xl">
                マイページへ行く
              </Text>
              <Text fontWeight="bold" fontSize="xl">
                キャラを探す
              </Text>
              <HStack
                flexDirection="row"
                alignItems="start"
                w="full"
                spacing={0}
              >
                <Button
                  onClick={handleToggle}
                  variant="link"
                  m={0}
                  _focus={{ boxShadow: "none" }}
                  padding={0}
                  justifyContent="flex-start"
                >
                  {showAdvanced ? (
                    <ChevronDownIcon boxSize={6} color="black" />
                  ) : (
                    <ChevronRightIcon boxSize={6} color="black" />
                  )}
                </Button>
                <Text fontWeight="bold" fontSize="xl">
                  高度な機能
                </Text>
                s{/* <Spacer /> */}
              </HStack>
              <Collapse in={showAdvanced}>
                <VStack align="start" pl={5} spacing={5}>
                  <Text fontWeight="bold" fontSize="md">
                    キャラを作る
                  </Text>
                  <Text fontWeight="bold" fontSize="md">
                    WalletConnect
                  </Text>
                </VStack>
              </Collapse>
              <Box h="2px" w="full" bg="" my={6} />
              <Text fontWeight="bold" fontSize="xl">
                設定
              </Text>
              <Text fontWeight="bold" fontSize="xl">
                フィードバック
              </Text>
              <Text fontWeight="bold" fontSize="xl">
                お問い合わせ
              </Text>
              <Spacer />
              <Text fontWeight="bold" fontSize="xx-small" mt="auto">
                ©KG, Inc. All rights reserved
              </Text>
            </VStack>
          </DrawerContent>
        </Drawer>
      </Slide>
    </Box>
  );
};

export default ChatPage;
