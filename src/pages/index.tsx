import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Container, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import axios from "axios";

const MotionBox = motion(Box);

export default function Home() {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    async function fetchResponse() {
      try {
        const apiKey = process.env.OPENAI_API_KEY;
        const endpoint =
          "https://parket.openai.azure.com/openai/deployments/test-20230412/chat/completions?api-version=2023-03-15-preview";

        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        };

        const messages = [
          {
            role: "system",
            content:
              "You are a marketing writing assistant. You help come up with creative content ideas and content like marketing emails, blog posts, tweets, ad copy, and product descriptions. You write in a friendly yet professional tone but can tailor your writing style that best works for a user-specified audience. If you do not know the answer to a question, respond by saying 'I do not know the answer to your question.'",
          },
        ];

        const payload = {
          engine: "test",
          messages: messages,
          temperature: 0.7,
          max_tokens: 400,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: null,
        };

        const response = await axios.post(endpoint, payload, { headers });
        setResponse(response.data);
      } catch (error) {
        console.error("Error fetching response from OpenAI API:", error);
      }
    }

    fetchResponse();
  }, []);

  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const transition = { duration: 0.5 };

  return (
    <MotionBox
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      bgGradient="linear(to-r, green.200, pink.500)"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Container
        maxW="container.xl"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Heading as="h1" size="3xl" color="white">
          Welcome to Mint!
        </Heading>

        <Text mt={4} fontSize="xl" color="white">
          We're glad to have you here. Let's get started!
        </Text>

        {response && (
          <Box mt={8} p={4} bg="white" borderRadius="md">
            <Text fontWeight="bold" fontSize="lg">
              AI Response:
            </Text>
            <Text mt={2}>{response}</Text>
          </Box>
        )}

        <Stack
          direction="row"
          spacing={4}
          align="center"
          justify="center"
          mt={10}
        >
          <Link href="/register" passHref>
            <Button color="white" bg="black" size="lg">
              登録に進む
            </Button>
          </Link>
        </Stack>
      </Container>
    </MotionBox>
  );
}
