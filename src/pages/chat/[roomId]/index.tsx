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
import { createChat, getChatRoomsByroomId, getSingleChats } from "@/components/models/chat";
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
  const [isEnterPressed, setEnterPressed] = useState(false);

  const roomId =
  typeof router.query.roomId === "string" ? router.query.roomId : "";

  const [text, setText] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserType | null>(null);
  const [chatrooms, setChatrooms] = useState<ChatRoomType[]>([]);
  const [otherUsers, setOtherUsers] = useState<UserType[] | undefined>([]);

  // メッセージ配列の状態を管理
  const [messages, setMessages] = useState<ChatType[]>();

  // Todo ここでreceiverIdからuserInfoを取得する
  const aiInfo = getAI("1");

  //APIレスポンス待ち
  const [isLoading, setIsLoading] = useState(false);

  // Todo 無限ローディングのため一旦コメントアウト
  //カウンター
  const [dotsCount, setDotsCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setDotsCount((prevCount) => (prevCount + 1) % 4); // ドットの数を4で割った余りを更新
    }, 450); // 450ミリ秒ごとに更新

    const timeout = setTimeout(() => {
      clearInterval(interval); // 1分後にインターバルをクリアする
    }, 60000); // 1分(60秒)

    return () => {
      clearInterval(interval); // コンポーネントがアンマウントされた時にインターバルをクリアする
      clearTimeout(timeout); // コンポーネントがアンマウントされた時にタイムアウトもクリアする
    };
  }, []);


  //スクロール部分表示操作
  const messagesEndRef = useRef<HTMLDivElement>(null);

  //Localのユーザーデータの取得
  useEffect(() => {
    const data = localStorage.getItem("user");
    // データがnullではない場合、それをパースします
    if (data !== null) {
      setUserInfo(JSON.parse(data));
    }
  }, []);

  //表示画面のchatroom取得
  useEffect(() => {
    if (router.isReady) {
      const roomId = router.query.roomId;
      if (roomId && typeof roomId === 'string') {
      getChatRoomsByroomId(roomId).then(setChatrooms);
     console.log("Chatrooms :", chatrooms);
    }
  }
  },[router.isReady, router.query]);

  //
  useEffect(() => {
    if (!userInfo || !chatrooms.length) return;

    const otherUserIds = chatrooms.map(room => {
      if (room && Array.isArray(room.participants_id)) {
        return room.participants_id.find(id => id !== userInfo.id);
      }
      return null;
    }).filter(Boolean);
    
    //関連ユーザー情報の取得
    Promise.all(otherUserIds.map(id => id && getUser(id)))
    .then(users => users.filter((user): user is UserType => user !== null && user !== undefined))
    .then(setOtherUsers);
  }, [userInfo, chatrooms]);

  //Chatを取得する処理
  useEffect(() => {
    if (!userInfo || !chatrooms.length) return;
    getSingleChats(roomId).then((chats) => {
      chats.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(chats);
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

  //入力ボタンがクリックされた時の挙動
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

      // Send chat info to the API to create a chat
      await createChat(chatInfo);
      setMessages(prevMessages => prevMessages ? [...prevMessages, chatInfo] : [chatInfo]);

      // AI response
      const aiMessage = await sendToAI(text);
      const aiChatInfo: ChatType = {
        chatId: uuid(),
        chatRoomId: roomId,
        user_id: "AI",
        message: aiMessage,
        createdAt: new Date().getTime(),
      };

      // Send AI chat info to the API to create a chat
      await createChat(aiChatInfo);
      setMessages(prevMessages => prevMessages ? [...prevMessages, aiChatInfo] : [aiChatInfo]);

      // ローディング状態を無効にする
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  //Azure Function Call
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
            {otherUsers && otherUsers.length > 0 && otherUsers[0].userName}
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
          const otherUser = otherUsers?.find(user => user.id === message.user_id);
          const avatarSrc = otherUser ? otherUser.pfp : undefined;

          console.log("Avatar",avatarSrc);
          return (
            <Message
              key={message.chatId}
              chat={message}
              imgSrc={avatarSrc}
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
                {/* 入力中 */}
                入力中{Array(dotsCount + 1).join(".")}
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
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault(); // formが自動的にリフレッシュされるのを防ぐ
                setEnterPressed(true);
                handleSubmit();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                setEnterPressed(false);
              }
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
            onClick={() => {
              if (!isEnterPressed) {
                handleSubmit();
              }
            }}
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
