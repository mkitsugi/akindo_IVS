import React from "react";
import { ChatType } from "@/types/chat/chatType";
import { Avatar, Flex, Text, Box } from "@chakra-ui/react";
import { getUser } from "../models/user";
import { useEffect, useState } from "react";
import { UserType } from "@/types/user/userType";

type PropsType = {
  chat: ChatType;
  isSender?: boolean;
};

export function Message(props: PropsType): JSX.Element {
  const [userInfo, setUserInfo] = useState<UserType | null>(null);

  const isSender = userInfo?.id === props.chat.user_id;

  useEffect(() => {
    const data = localStorage.getItem("user");
    // データがnullではない場合、それをパースします
    if (data !== null) {
      setUserInfo(JSON.parse(data));
    }
  }, []);

  console.log(userInfo);

  return (
    <Flex
      gap={5}
      mx={"1rem"}
      direction={isSender ? "row-reverse" : "row"}
      alignItems="center"
    >
      {props.isSender && <Avatar src={"/" + userInfo?.pfp ?? ""} size={"sm"} />}

      <Box
        p={2}
        bgColor={isSender ? "#EF7C76" : "white"}
        color={isSender ? "white" : "black"}
        borderRadius={"10px"}
        maxWidth={"75%"}
      >
        <Text p={1} pl={1} wordBreak={"break-word"} overflowWrap={"break-word"}>
        {props.chat.message.split('\n').map((str, index) => 
            <React.Fragment key={index}>{str}<br /></React.Fragment>
          )}
        </Text>
      </Box>
    </Flex>
  );
}
