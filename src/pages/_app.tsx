import "../styles/globals.css";
import React from "react";
import { ChakraProvider, Flex } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import theme from "../styles/theme";
import BackgroundImage from "@/components/bg";

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <div className="wrapper" style={{ position: "relative" }}>
        <BackgroundImage />

        <Component {...pageProps} />
      </div>
    </ChakraProvider>
  );
}

export default App;
