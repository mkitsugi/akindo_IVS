import "../styles/globals.css";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default App;
