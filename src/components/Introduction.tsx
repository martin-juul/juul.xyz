import * as React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

export function Introduction() {
  return (
    <Flex h="100vh" justify="center" direction="column">
      <Flex align="center" justify="space-between">
        <Box>
          <Text as="h1" fontSize={28} fontWeight={300} color="magenta.200">Hello, my mother named me</Text>
          <Text fontSize={64} fontWeight={600}>Martin</Text>
          <Text fontSize={48} fontWeight={500} color="gray.200">I create and destroy software for a living.</Text>
        </Box>
      </Flex>

      <Box mt={3}>
        <Text color="gray.200">Developer based in Denmark. My speciality is building great software that looks good inside-out.</Text>
      </Box>
    </Flex>
  )
}
