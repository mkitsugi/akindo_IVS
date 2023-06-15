import "../styles/globals.css";
import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import theme from "../styles/theme";
import BackgroundImage from "@/components/bg";
import { useWindowHeight } from '@/hooks/useWindow';



function App({ Component, pageProps }: AppProps) {

  const windowHeight = useWindowHeight();

  return (
    <ChakraProvider theme={theme}>
      <Box maxW="375px" m="auto" maxHeight={`${windowHeight}px`} >
        <BackgroundImage  />
        <Component {...pageProps} />
        </Box>
    </ChakraProvider>
  );
}

export default App;
