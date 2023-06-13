import { useState } from "react";
import { Flex, Text, Input, Button, HStack, VStack } from "@chakra-ui/react";
import Link from "next/link";

interface Step4Props {
  onNext: (nickname: string) => void;
  onBack: () => void;
}

function Step4({ onNext, onBack }: Step4Props) {
  const [nickname, setNickname] = useState("");

  const handleButtonClick = () => {
    onNext(nickname);
  };

  return (
    <Flex direction="column" align="center" justify="center" height="100vh">
      <HStack
        alignSelf="center"
        justifyContent="center"
        alignItems="center"
        py={10}
      >
        {/* <ArrowBackIcon
          boxSize={6}
          onClick={onBack}
          _hover={{
            color: "gray", // マウスホバー時に少し下に移動
          }}
          transition="0.2s"
        />{" "}
        戻るアイコン */}
        <Text fontSize="2xl" fontWeight="bold">
          あなたの肩書きは？
        </Text>
      </HStack>
      <Input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="職業/肩書きを入力"
        mb={10}
        w="280px"
        h="60px"
        // variant="filled"
        focusBorderColor="red.300"
        bg="white.200"
        _hover={{ bg: "gray.100" }}
      />
      <VStack spacing={3}>
        <Link href="/list" passHref>
          <Button
            w="280px"
            bg="red.300"
            color="white"
            _hover={{
              bg: "red.200",
              transform: "translateY(5px)", // マウスホバー時に少し下に移動
            }}
            transition="0.2s" // トランジション効果を追加
          >
            チャット画面に進む
          </Button>
        </Link>
        <Button
          onClick={onBack}
          w="280px"
          bg="gray.500"
          color="white"
          _hover={{
            bg: "gray",
            transform: "translateY(5px)", // マウスホバー時に少し下に移動
          }}
          transition="0.2s" // トランジション効果を追加
        >
          戻る
        </Button>
      </VStack>
    </Flex>
  );
}

export default Step4;
