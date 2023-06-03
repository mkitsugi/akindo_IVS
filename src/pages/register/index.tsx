import React from "react";
import Image from "next/image";
import {
  Flex,
  Box,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Heading,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import styles from "../../styles/Index.module.css";

// Mock data for people
const people = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  description: `This is person ${i + 1}`,
  imageUrl: `/images/${(i % 7) + 1}.png`,
}));

const MotionBox = motion(Box);

const Search = () => {
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3, xl: 4 });
  const router = useRouter();

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const transition = { duration: 0.5 };

  return (
    <MotionBox
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={transition}
      p={10}
      bgGradient="linear(to-r, green.200, pink.500)"
      borderRadius="md"
    >
      <Flex justifyContent="center" alignItems="center" pt={10}>
        <VStack pl={50}>
          <HStack
            width={{ base: "100%", md: "80%", lg: "60%" }}
            justifySelf="center"
            mb={4}
          >
            <IconButton
              aria-label="Go back"
              icon={<ArrowBackIcon />}
              onClick={() => router.back()}
              colorScheme="whiteAlpha"
              zIndex={1}
            />
            <Heading as="h1" size="xl" color="white" pl={3}>
              Search your favorite
            </Heading>
          </HStack>
          <SimpleGrid
            columns={columns}
            maxWidth={{ base: "90%", md: "80%", lg: "60%" }}
            spacing={8}
            pr={50}
            pt={10}
            pb={10}
          >
            {people.map((person) => (
              <VStack
                key={person.id}
                boxShadow="md"
                borderRadius="md"
                overflow="hidden"
                bg="white"
              >
                <Image
                  className={styles.image}
                  src={person.imageUrl}
                  alt={person.name}
                  fill
                />
                <Box pb={3} pl={3} width="100%" textAlign="start">
                  <Text fontWeight="bold" fontSize="md">
                    {person.name}
                  </Text>
                  <Text fontSize="sm">{person.description}</Text>
                </Box>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Flex>
    </MotionBox>
  );
};

export default Search;
