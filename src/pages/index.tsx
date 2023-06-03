import React from "react";
import { Box, Container, Heading, Text, Button, Stack } from "@chakra-ui/react";

export default function Home() {
  return (
    <Box bgGradient="linear(to-r, green.200, pink.500)" minHeight="100vh">
      <Container
        maxW="container.xl"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Heading as="h1" size="2xl" color="white">
          Welcome to our landing page!
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
          <Button colorScheme="teal" size="lg" onClick={() => alert("Hello!")}>
            Click Me!
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
