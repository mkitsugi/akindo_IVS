import Image from "next/image";
import { ChakraProvider, Box } from "@chakra-ui/react";
import background from "images/background.png";
import { useWindowHeight } from '@/hooks/useWindow';


function BackgroundImage() {

  const windowHeight = useWindowHeight();

  return (
    <Box zIndex="-1" position="absolute" h={`${windowHeight}px`} width="375px">
      <Image src={background} alt="Background image description" fill/>
    </Box>
  );
}

export default BackgroundImage;
