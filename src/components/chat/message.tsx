import { ChatType } from "@/types/chat/chatType";
import { Avatar, Flex, Text, Box } from "@chakra-ui/react";
import { getUser } from "../models/user";

type PropsType = {
  chat: ChatType;
  isSender?: boolean;
};

export function Message(props: PropsType): JSX.Element {
  const userInfo = getUser(
    props.isSender ? props.chat.receiverId : props.chat.senderId
  );
  const isSender = userInfo.id === props.chat.senderId;

  return (
    <Flex gap={5} mx={"1rem"} direction={isSender ? "row-reverse" : "row"} alignItems="center">
      <Avatar src={userInfo.pfp} size={"sm"} />
      <Box 
        p={2}
        bgColor={isSender ? "#EF7C76" : "white"} 
        color={isSender ? "white" : "black"} 
        borderRadius={"10px"}
        maxWidth={"75%"}
      >
          <Text p={1} pl={1} wordBreak={"break-word"} overflowWrap={"break-word"}>{props.chat.message}</Text>
      </Box>
    </Flex>
  );
}
