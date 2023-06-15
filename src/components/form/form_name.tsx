import { useState } from "react";
import { Flex, Text, Input, Button, HStack, VStack } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";

type SurveyData = {
  gender?: string;
  name?: string;
  age?: number;
  job?: string;
};

interface Step2Props {
  onNext: (data: SurveyData) => void;
  onBack: () => void;
}

function Step2({ onNext, onBack }: Step2Props) {
  const [nickname, setNickname] = useState("");

  const handleButtonClick = () => {
    onNext({name : nickname});
  };

  return (
    <Flex direction="column" align="center" justify="center" height="100vh">
      <HStack
        alignSelf="center"
        justifyContent="center"
        alignItems="center"
        py={10}
      >
        {/* <ArrowUpIcon
          boxSize={6}
          onClick={onBack}
          _hover={{
            color: "gray", // マウスホバー時に少し下に移動
          }}
          transition="0.2s"
        />{" "}
        戻るアイコン */}
        <Text fontSize="2xl" fontWeight="bold">
          あなたのニックネームは？
        </Text>
      </HStack>
      <Input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="ニックネームを入力"
        mb={10}
        w="280px"
        h="60px"
        // variant="filled"
        focusBorderColor="red.300"
        bg="white.200"
        _hover={{ bg: "gray.100" }}
      />
      <VStack spacing={3}>
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

export default Step2;
