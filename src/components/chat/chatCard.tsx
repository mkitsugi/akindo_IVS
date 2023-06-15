import { UserType } from "@/types/user/userType";
import { AIType } from "@/types/AI/aiType";
import { Avatar, Flex, Spacer, Text, Badge, Link } from "@chakra-ui/react";
import { SearchIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { ChatType } from "@/types/chat/chatType";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { ChatRoomType } from "@/types/chat/chatRoomType";

type PropsType = {
  userInfo?: UserType,
  ChatRoomInfo: ChatRoomType;
  lastMessage? : string,
  unreadMessages: number;
};

export function ChatCard(props: PropsType): JSX.Element {
  const router = useRouter();
  const userInfo = props.userInfo;
  const chatRoomInfo = props.ChatRoomInfo;

  const lastMessage = props.lastMessage;

  const query = {

  }

  return (
    <Link
      as={NextLink}
      href={`/chat/${chatRoomInfo.chatroomId}`}
      textDecoration={"none"}
      _hover={{ textDecoration: "none" }}
    >
      <Flex
        alignItems={"center"}
        gap={5}
        textDecoration={"none"}
        onClick={() => {
          router.push(
            {
              pathname: `/chat/${chatRoomInfo.chatroomId}`,
              // query: ChatInfo,
            },
            `/chat/${chatRoomInfo.chatroomId}`
          );
        }}
      >
        <Avatar src={userInfo?.pfp} />
        <Flex direction={"column"} gap={1}>
          <Flex alignItems={"center"} minW={"270px"}>
            <Text fontWeight={"bold"}>{userInfo?.userName}</Text>
            {(userInfo?.id === "AI") && (
              <CheckCircleIcon color="blue.400" ml={2} />
            )}
            <Spacer />
            <Text color="gray.500">19:35</Text>
          </Flex>

          <Flex>
            <Text isTruncated whiteSpace="nowrap" overflow="hidden">
              {lastMessage}
            </Text>
            <Spacer />
            {props.unreadMessages > 0 && (
              <Badge
                colorScheme="pink"
                color="black"
                borderRadius="full"
                width="24px"
                height="24px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {props.unreadMessages}
              </Badge>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
}
