import { ChatType } from "@/types/chat/chatType";
import { Avatar, Flex, Text } from "@chakra-ui/react";
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
    <Flex gap={5} mx={"1rem"} direction={isSender ? "row-reverse" : "row"}>
      <Avatar src={userInfo.pfp} />
      <Flex
        bgColor={isSender ? "#EF7C76" : "white"}
        color={isSender ? "white" : "black"}
        w={"270px"}
        borderRadius={"10px"}
        alignItems={"center"}
        px={"1rem"}
      >
        <Text w={"270px"} wordBreak={"break-all"} fontWeight={"semibold"}>
          {props.chat.message}
        </Text>
      </Flex>
    </Flex>
  );
}
