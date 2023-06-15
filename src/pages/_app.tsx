import "../styles/globals.css";
import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import theme from "../styles/theme";
import BackgroundImage from "@/components/bg";

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <Box maxW="375px" m="auto" position="relative">
        <BackgroundImage />
        <Component {...pageProps} />
        </Box>
    </ChakraProvider>
  );
}

export default App;
