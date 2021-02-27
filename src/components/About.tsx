import * as React from 'react';
import { Flex, Image, Box, Text } from '@chakra-ui/react';

export function About() {
  return (
    <Flex direction="row" align="center">
      <Box fontSize={18} color="gray.300">
        <Text>Hi there! I'm Martin, a software engineer based in Denmark.</Text>
        <Text mt={2}>I am a very curious about new technologies and enjoy trying out new flavors of development in my
          spare time.</Text>
        <Text mt={2}>Holding myself to the highest standard, i take pride in delivering quality on time.</Text>
        <Text>As a self-starter, and not being afraid of taking ownership. I am rarely bored.</Text>

        <Text mt={2}>Whether it is backend or frontend. I find both to be equally interesting. Presenting different
          challenges both cover many of the same paradigms. Implementation details aside.</Text>
      </Box>

      <Box pl={8}>
        <Image
          src="https://avatars.githubusercontent.com/u/11337105?s=400&u=373f22c1631151d6fa4919de0b0db1306167d08b&v=4"
          rounded="50%"
          w="400px"
        />
      </Box>
    </Flex>
  );
}
