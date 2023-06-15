import {
  Flex,
  Input,
  Spacer,
  Text,
  Box,
  Container,
  Avatar,
} from "@chakra-ui/react";
import { ChevronLeftIcon, HamburgerIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import { BiPaperPlane } from "react-icons/bi";
import axios from "axios";
import { useRouter } from "next/router";
import { getAI } from "@/components/models/ai";
import { getUser } from "@/components/models/user";
import { createChat, getChatRooms, getChats } from "@/components/models/chat";
import { Message } from "@/components/chat/message";
import { ChatType } from "@/types/chat/chatType";
import { uuid } from "uuidv4";
import { useWindowHeight } from "@/hooks/useWindow";
import { ChatRoomType } from "@/types/chat/chatRoomType";
import { UserType } from "@/types/user/userType";

const Index = () => {
  const router = useRouter();

  const windowHeight = useWindowHeight();

  const [isInputFocused, setInputFocus] = useState(false);

  const roomId =
    typeof router.query.roomId === "string" ? router.query.roomId : "";

  // const receiverId =
  //   typeof router.query.receiverId === "string" ? router.query.receiverId : "";

  const [text, setText] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [chatrooms, setChatrooms] = useState<ChatRoomType[]>([]);

  // メッセージ配列の状態を管理
  const [messages, setMessages] = useState<ChatType[]>();

  // Todo ここでreceiverIdからuserInfoを取得する
  const aiInfo = getAI("1");

  //APIレスポンス待ち
  const [isLoading, setIsLoading] = useState(false);

  // Todo 無限ローディングのため一旦コメントアウト
  //カウンター
  // const [dotsCount, setDotsCount] = useState(0);
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setDotsCount((prevCount) => (prevCount + 1) % 4); // ドットの数を4で割った余りを更新
  //   }, 450); // 400ミリ秒ごとに更新

  //   return () => {
  //     clearInterval(interval); // コンポーネントがアンマウントされた時にインターバルをクリアする
  //   };
  // }, []);

  //スクロール部分表示操作
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    getChats(chatrooms).then((chatArrays) => {
      // Flatten the array of chat arrays into a single array
      const allChats = chatArrays.reduce(
        (acc, chats) => [...acc, ...chats],
        []
      );
      // Sort the chats by createdAt timestamp in descending order
      allChats.sort((a, b) => b.createdAt - a.createdAt);
      setMessages(allChats);
    });
  }, [userInfo, chatrooms]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const handleSubmit = async () => {
    try {
      // Clear the input field
      setText("");

      setTimeout(async () => {
        // ローディング状態を有効にする
        setIsLoading(true);
      }, 1500);

      if (!userInfo) return;

      // User message
      const chatInfo: ChatType = {
        chatId: uuid(),
        chatRoomId: roomId,
        user_id: userInfo.id,
        message: text,
        createdAt: new Date().getTime(),
      };

      console.log("chatInfo", chatInfo);

      createChat(chatInfo);
      const _messages = messages ? [...messages, chatInfo] : [chatInfo];
      setMessages(_messages); // メッセージ配列に新しいユーザーメッセージを追加

      // AI response
      const aiMessage = await sendToAI(text);
      const aiChatInfo: ChatType = {
        chatId: uuid(),
        chatRoomId: roomId,
        user_id: "ai",
        message: aiMessage,
        createdAt: new Date().getTime(),
      };
      createChat(aiChatInfo);
      const _messages2 = messages ? [...messages, aiChatInfo] : [aiChatInfo];
      setMessages(_messages2); // メッセージ配列に新しいAIメッセージを追加

      // ローディング状態を無効にする
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  const sendToAI = async (message: string) => {
    try {
      const response = await axios.post("/api/chat_gptResponse", { message });
      console.log("API Response:", response); // APIのレスポンスを確認
      return response.data;
    } catch (e) {
      console.error("API Error:", e); // APIからのエラーを確認
    }
  };

  if (!userInfo) return <></>;

  return (
    <Flex
      direction={"column"}
      py="1rem"
      h={isInputFocused ? `${windowHeight}px` : `${windowHeight}px`}
      overflow={"hidden"}
    >
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        px="1rem"
        mb="1rem"
      >
        <Box
          onClick={() => {
            router.back();
          }}
        >
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

      <Flex
        direction={"column"}
        gap={5}
        mt={"0rem"}
        mb={"1rem"}
        overflowY="scroll"
        flexGrow={1}
        ref={messagesEndRef}
      >
        {/* <Message key={message.chatId} chat={message} isSender={true} /> */}
        {messages?.map((message) => {
          const isUserMessage = message.user_id !== userInfo.id; // Check if the message is sent by the user
          return (
            <Message
              key={message.chatId}
              chat={message}
              isSender={isUserMessage}
            />
          );
        })}
        {isLoading ? (
          <Flex gap={5} mx={"1rem"} direction={"row"} alignItems="center">
            <Avatar src={"/" + aiInfo.pfp} size={"sm"} />
            <Box
              p={2}
              bgColor={"white"}
              color={"black"}
              borderRadius={"10px"}
              maxWidth={"75%"}
            >
              <Text
                p={1}
                pl={1}
                wordBreak={"break-word"}
                overflowWrap={"break-word"}
              >
                入力中
                {/* 入力中{Array(dotsCount + 1).join(".")} */}
                {/* カウンター変数の値に基づいてドットを表示 */}
              </Text>
            </Box>
          </Flex>
        ) : (
          <></>
        )}
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
