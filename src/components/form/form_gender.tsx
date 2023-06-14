import { Flex, Text, Button } from "@chakra-ui/react";

type SurveyData = {
  gender?: string;
  name?: string;
  age?: number;
  job?: string;
};

interface Step1Props {
  onNext: (data : SurveyData) => void;
}

function Step1({ onNext }: Step1Props) {
  const handleButtonClick = (selectedGender: string) => {
    onNext({ gender: selectedGender });
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      fontFamily="MyFont"
    >
      <Text fontSize="2xl" fontWeight="bold">
        あなたの性別は？
      </Text>
      <Button
        m={2}
        w="100px"
        h="100px"
        fontSize="1.5em"
        borderRadius="50%"
        bgColor="blue.100"
        onClick={() => handleButtonClick("男性")}
      >
        男性
      </Button>
      <Button
        m={2}
        w="100px"
        h="100px"
        fontSize="1.5em"
        borderRadius="50%"
        bgColor="pink.200"
        onClick={() => handleButtonClick("女性")}
      >
        女性
      </Button>
      <Button
        m={2}
        w="100px"
        h="100px"
        fontSize="1.5em"
        borderRadius="50%"
        onClick={() => handleButtonClick("その他")}
      >
        その他
      </Button>
    </Flex>
  );
}

export default Step1;
