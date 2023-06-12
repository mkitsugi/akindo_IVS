import { useEffect, useState } from "react";
import "../styles/globals.css";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import styled from "styled-components";
import background from "images/background.png";
// "images/background.png";

interface BackgroundProps {
  imageUrl: string;
}

const Background = styled.div<BackgroundProps>`
  width: 100%;
  height: 100%;
  background-image: url(${(props) => props.imageUrl});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

function App({ Component, pageProps }: AppProps) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // ページコンポーネントの読み込み時に画像 URL を取得する処理を追加
    setImageUrl(background.src);
  }, []);

  return (
    <ChakraProvider>
      <div className="wrapper">
        <Background imageUrl={background.src}>
          <Component {...pageProps} />
        </Background>
      </div>
    </ChakraProvider>
  );
}

export default App;
