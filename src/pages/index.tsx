import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Container, Heading, Text, Button, VStack, Spacer } from "@chakra-ui/react";
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
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      maxheight="100vh"
    >

      
      <Container
        maxW="container.xl"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >

        

        <VStack
          direction="row"
          spacing={4}
          align="center" // コンテンツを上下中央に配置
          justifyContent="center"
          height="80vh"
        >


          <Heading as="h1" size="3xl" color="black">
              Welcome to Osekk.ai!
          </Heading>

         <Text mt={4} fontSize="xl" color="black">
           We&apos;re glad to have you here. Let&apos;s get started!
          </Text>


          <Link href="/form" passHref>
            <Button color="white" bg="black" size="lg">
              登録に進む
            </Button>
          </Link>

          <Link  href="/list" passHref>
            <Text mt={3} color="gray"  size="sm">
              Dev用の遷移(フォーム入力不要)
            </Text>
          </Link>

        </VStack>
      </Container>
    </MotionBox>
  );
}
