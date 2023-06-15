import { useState } from "react";
import {
  Flex,
  Text,
  Button,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack,
} from "@chakra-ui/react";

type SurveyData = {
  gender?: string;
  name?: string;
  age?: number;
  job?: string;
};

interface Step3Props {
  onNext: (data: SurveyData) => void;
  onBack: () => void;
}

function Step3({ onNext, onBack }: Step3Props) {
  const [age, setAge] = useState(19);

  const handleButtonClick = () => {
    onNext({age : age});
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
          あなたの年齢は？
        </Text>
      </HStack>

      <NumberInput
        value={age}
        onChange={(valueString) => setAge(parseInt(valueString))}
        placeholder="年齢を入力"
        mb={10}
        w="280px"
        rounded={8}
        bg="white"
        size="lg"
        // h="60px"
        // focusBorderColor="red.300"

        _hover={{ bg: "gray.100" }}
        min={19} // 年齢の最小値
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>

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

export default Step3;
