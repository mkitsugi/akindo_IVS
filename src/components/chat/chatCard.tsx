import { UserType } from "@/types/user/userType";
import { Avatar, Flex, Spacer, Text, Badge, Link } from "@chakra-ui/react";
import { SearchIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { ChatType } from "@/types/chat/chatType";
import NextLink from "next/link";
import { useRouter } from "next/router";

type PropsType = {
  userInfo: UserType;
  lastChat: ChatType;
  unreadMessages: number;
};

export function ChatCard(props: PropsType): JSX.Element {
  const router = useRouter();
  const userInfo = props.userInfo;
  const lastChat = props.lastChat;

  const query = {
    roomId: lastChat.chatRoomId,
    receiverId: lastChat.receiverId,
  };

  return (
    <Link
      as={NextLink}
      href={`/chat/${lastChat.chatRoomId}`}
      textDecoration={"none"}
    >
      <Flex
        alignItems={"center"}
        gap={5}
        textDecoration={"none"}
        onClick={() => {
          router.push(
            {
              pathname: `/chat/${lastChat.chatRoomId}`,
              query: query,
            },
            `/chat/${lastChat.chatRoomId}`
          );
        }}
      >
        <Avatar src={userInfo.pfp} />
        <Flex direction={"column"} gap={1}>
          <Flex alignItems={"center"} minW={"270px"}>
            <Text fontWeight={"bold"}>{userInfo.userName}</Text>
            <CheckCircleIcon color="blue.400" ml={2} />
            <Spacer />
            <Text color="gray.500">19:35</Text>
          </Flex>

          <Flex>
            <Text isTruncated whiteSpace="nowrap" overflow="hidden">
              {lastChat.message}
            </Text>
            <Spacer />
            {props.unreadMessages > 0 && (
              <Badge
                colorScheme="red"
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
