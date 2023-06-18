import {
  Flex,
  Input,
  Spacer,
  Text,
  Box,
  Container,
  Avatar,
} from "@chakra-ui/react";
import { useSpring, animated } from "react-spring";
import { ChevronLeftIcon, HamburgerIcon, ChevronRightIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import { BiPaperPlane, BiPaperclip } from "react-icons/bi";
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
import React from "react";

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


  // ファイル入力フィールドへの参照を作成
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  // アイコンがクリックされたときのハンド
  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  //画像アップロード用
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleImageUpload = async(e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userInfo) {
      console.log("User info is null");
      return; // or handle this case appropriately
    }
  
    const files = e.target.files;
  
    if (files && files.length > 0) {
      const file = files[0];
  
      // Convert the file to an ArrayBuffer, then Base64 encode it
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result;
  
        if (arrayBuffer instanceof ArrayBuffer) {
          const base64 = btoa(
            new Uint8Array(arrayBuffer)
              .reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
  
          // APIエンドポイントにPOST
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: base64 }),
          });
  
          // レスポンスからアップロードされた画像のURLを取得
        console.log("response", response);
        if (response.ok) {
          const data = await response.json();
          console.log('Uploaded image URL:', data.imageUrl);

          // Use the uploaded image URL to update the user's imgSrc in the database
          const updateResponse = await fetch('/api/user_update_img', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userInfo.id, imageUrl: data.imageUrl }),
          });

          if (updateResponse.ok) {
            console.log('Updated user imgSrc successfully');

            // User message
            const chatInfo: ChatType = {
              chatId: uuid(),
              chatRoomId: roomId,
              user_id: userInfo.id,
              message: data.imageUrl,
              createdAt: new Date().getTime(),
              isImage: true,
            };

            // Send chat info to the API to create a chat
            await createChat(chatInfo);
            setMessages(prevMessages => prevMessages ? [...prevMessages, chatInfo] : [chatInfo]);

          } else {
            console.error('Failed to update user imgSrc');
          }
        }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  

  const handleSubmitWithImage = () => {
    // TODO: Implement image upload logic here
    // selectedFile contains the file to be uploaded
  };

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

  //矢印ボタン
  const [showRequestBox, setShowRequestBox] = useState(false);
  const { transform } = useSpring({
    // アイコンが真っ直ぐ（0deg）または下向き（90deg）になる
    transform: showRequestBox ? "rotate(0deg)" : "rotate(90deg)",
  });


  //スクロール部分表示操作
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

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

  //別ユーザーのidを取得
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
        isImage: false,
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
        isImage: false,
      };
      if (aiChatInfo.message) {
        // Send AI chat info to the API to create a chat
        await createChat(aiChatInfo);
        setMessages(prevMessages => prevMessages ? [...prevMessages, aiChatInfo] : [aiChatInfo]);
      }
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
      const response = await axios.post("/api/chat_gptResponse", { message, roomId });
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
          alignItems={"center"}
          mb="1rem"
        >
        <Flex
            alignItems={"center"}
            justifyContent={"space-between"}
            px="1rem"
            mb="1rem"
          >
          <Box
            as="button"
            w="30px"
            h="30px"
            borderRadius="full"
            bgColor="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={() => setShowRequestBox(!showRequestBox)}
            _hover={{ bgColor: "#f7fafc" }}
          >
            <animated.div style={{ transform }}>
              <ChevronRightIcon fontSize={"24px"} />
            </animated.div>
          </Box>
        </Flex>

        {showRequestBox && (
            <Box
              fontSize="12px"
              color="white"
              borderWidth="1.5px"
              borderRadius="md"
              bg="#dd6b63"
              borderColor="#dd6b63"
              p="1"
              ml="0" // Boxコンポーネントが直接ボタンにくっつかないように、左マージンを追加します
              mb="1rem"
            >
              マッチングを依頼する
            </Box>
          )}
      </Flex>

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
            placeholder="メッセージを入力..."
            border="none"
            onFocus={() => setInputFocus(true)}
            onBlur={() => setInputFocus(false)}
          />

            <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
            />  
            <Box
              as="button"
              cursor="pointer"
              w="45px"
              h="40px"
              // bgColor="#EF7C76"
              // borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              onClick={handleIconClick}
              _active={{
                transform: "scale(0.95)",
              }}
            >
              <BiPaperclip color="black" size="20px" />
            </Box>
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
