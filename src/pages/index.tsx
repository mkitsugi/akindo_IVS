import React from "react";
import Link from "next/link";
import { Box, Container, Heading, Text, Button, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function Home() {
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
