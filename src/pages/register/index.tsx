import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Flex,
  Box,
  SimpleGrid,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  Heading,
  Textarea,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import styles from "../../styles/Index.module.css";

// Mock data for people
const people = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  description: `This is person ${i + 1}`,
  imageUrl: `/images/${(i % 7) + 1}.png`,
}));

const MotionBox = motion(Box);

const Register = () => {
  const [apiResponse, setApiResponse] = useState<{ message?: string }>({});
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: string }[]>(
    []
  );

  const router = useRouter();

  const submitHandler = async () => {
    setIsLoading(true); // Set loading state before making the request

    // Add user message and API response to messages
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputValue, sender: "user" },
    ]);
    setInputValue(""); // Reset the input field

    try {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
        }),
      });

      const data = await response.json();

      // Add user message and API response to messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.message, sender: "api" },
      ]);

      setApiResponse(data); // Set the response state
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false); // Reset loading state after the request is complete
    }
  };

  useEffect(() => {
    const fetchApiResponse = async () => {
      try {
        const res = await fetch("/api/chatgpt");
        const data = await res.json();
        setApiResponse(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchApiResponse();
  }, []);

  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 4 });

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const transition = { duration: 0.5 };

  return (
    <MotionBox
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      p={10}
      bgGradient="linear(to-r, green.200, pink.500)"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Flex justifyContent="center" alignItems="center" pt={10}>
        <VStack pl={50} width={{ base: "100%", md: "80%", lg: "100%" }}>
          <HStack justifySelf="center" mb={4}>
            <IconButton
              aria-label="Go back"
              icon={<ArrowBackIcon />}
              onClick={() => router.back()}
              colorScheme="whiteAlpha"
              zIndex={1}
            />
            <Heading as="h1" size="xl" color="white" pl={3}>
              あなたについてお聞きします
            </Heading>
          </HStack>

          <Text fontSize="xl" pb={4}>
            AIがあなたを学習します
          </Text>

          {apiResponse.message && (
            <Box
              borderRadius="md"
              bg="teal.300"
              p={3}
              mb={4}
              width={{ base: "100%", md: "90%", lg: "50%" }}
            >
              {messages.map((message, index) => (
                <Flex
                  key={index}
                  textAlign={message.sender === "user" ? "end" : "start"}
                  bg={message.sender === "user" ? "white" : "yellow.300"}
                  color={message.sender === "user" ? "black" : "black"}
                  borderRadius="md"
                  px={4}
                  py={2}
                  mt={4}
                  mb={4}
                >
                  <Text>
                    {(message.text ?? "").split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </Text>
                </Flex>
              ))}
            </Box>
          )}

          <VStack
            spacing={4}
            mb={4}
            justifySelf="start"
            align="stretch"
            width={{ base: "100%", md: "100%", lg: "100%" }}
          >
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="メッセージを入力してください"
              bg="white"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  submitHandler();
                }
              }}
            />
            <Button onClick={submitHandler} isLoading={isLoading}>
              送信
            </Button>
          </VStack>

          {/* <SimpleGrid
            columns={columns}
            maxWidth={{ base: "90%", md: "80%", lg: "60%" }}
            spacing={8}
            pt={10}
            pb={10}
          >
            {people.map((person) => (
              <VStack
                key={person.id}
                boxShadow="md"
                borderRadius="md"
                overflow="hidden"
                bg="white"
              >
                <Image
                  className={styles.image}
                  src={person.imageUrl}
                  alt={person.name}
                  fill
                />
                <Box pb={3} pl={3} width="100%" textAlign="start">
                  <Text fontWeight="bold" fontSize="md">
                    {person.name}
                  </Text>
                  <Text fontSize="sm">{person.description}</Text>
                </Box>
              </VStack>
            ))}
          </SimpleGrid> */}
        </VStack>
      </Flex>
    </MotionBox>
  );
};

export default Register;
