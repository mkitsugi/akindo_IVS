// pages/chat/index.tsx
import { useState } from "react";
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
  HStack
} from "@chakra-ui/react";

import { SearchIcon, HamburgerIcon, ChevronRightIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { NextPage } from "next";
import { ChatCard } from "@/components/chat/chatCard";
import { getAI } from "@/components/models/ai";
import { getUser } from "@/components/models/user";
import { getChat } from "@/components/models/chat";


const ChatPage: NextPage = () => {
  // Todo ここでmessageを取得する
  const aiInfo = getAI("1");
  const userInfo = getUser("1");
  const allMessages = [getChat("1")];
  const unreadMessages = 2;

  //ハンバーガーアイコンの挙動
  const { isOpen, onOpen, onClose } = useDisclosure();

  // トグル状態の管理
  const [showAdvanced, setShowAdvanced] = useState(false);
  const handleToggle = () => setShowAdvanced(!showAdvanced);


  return (
    <Box p={4} pt={10}>
      <VStack spacing={0}>
      <HamburgerIcon
          aria-label="Menu"
          fontSize="28px"
          position="absolute"
          right={4}
          top={4}
          onClick={onOpen}  // アイコンクリックでメニューバーを開く
        />
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
      {allMessages.map((chat) => (
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

      {/* メニューバーの実装 */}
      <Slide direction="right" in={isOpen} style={{ zIndex: 10 }}>
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} >
          <DrawerOverlay />
            <DrawerContent position="absolute" right={0} w="30vw" maxW="200px">
              {/* メニューの内容をここに書く */}
             
              <VStack color="black" align="start" justify="center" h="full" pl={5} spacing={6} py={6}>
              <Spacer />
                <Text fontWeight="bold" fontSize="xl">マイページへ行く</Text>
                <Text fontWeight="bold" fontSize="xl">キャラを探す</Text>
                <HStack flexDirection="row" alignItems="start" w="full" spacing={0}>
                  <Button onClick={handleToggle} variant="link" m={0} _focus={{ boxShadow: "none" }} padding={0} justifyContent="flex-start">
                      {showAdvanced ? <ChevronDownIcon boxSize={6} color="black" /> : < ChevronRightIcon boxSize={6} color="black" />}
                  </Button>
                  <Text fontWeight="bold" fontSize="xl">高度な機能</Text>s
                  {/* <Spacer /> */}
                </HStack>
                <Collapse in={showAdvanced}>
                  <VStack align="start" pl={5} spacing={5} >
                    <Text fontWeight="bold" fontSize="md">キャラを作る</Text>
                    <Text fontWeight="bold" fontSize="md">WalletConnect</Text>
                  </VStack>
                </Collapse>
                <Box h="2px" w="full" bg="" my={6} />
                <Text fontWeight="bold" fontSize="xl">設定</Text>
                <Text fontWeight="bold" fontSize="xl">フィードバック</Text>
                <Text fontWeight="bold" fontSize="xl">お問い合わせ</Text>
                <Spacer />
                <Text fontWeight="bold" fontSize="xx-small" mt="auto">©KG, Inc. All rights reserved</Text>
              </VStack>
            </DrawerContent>
        </Drawer>
      </Slide>

    </Box>
  );
};

export default ChatPage;
