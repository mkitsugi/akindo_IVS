import { useState } from "react";
import { Flex, Text, Input, Button, HStack } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

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
        spacing={5}
        mr={6}
        py={10}
      >
        <ArrowBackIcon
          boxSize={6}
          onClick={onBack}
          _hover={{
            color: "gray", // マウスホバー時に少し下に移動
          }}
          transition="0.2s"
        />{" "}
        {/* 戻るアイコン */}
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
      <Button
        onClick={handleButtonClick}
        w="280px"
        bg="red.300"
        color="white"
        _hover={{
          bg: "red.200",
          transform: "translateY(5px)", // マウスホバー時に少し下に移動
        }}
        transition="0.2s" // トランジション効果を追加
      >
        次へ
      </Button>
    </Flex>
  );
}

export default Step4;
