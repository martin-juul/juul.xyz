import * as React from 'react';
import { chakra, Box, Flex, Text } from '@chakra-ui/react';

export function Introduction() {
  return (
    <Flex h="100vh" justify="center" direction="column">
      <Flex align="center" justify="space-between">
        <Box>
          <Text as="h1" fontSize={64} fontWeight={600}>Hi! I'm Martin</Text>
          <Text fontSize={32} fontWeight={500} color="gray.200">I create and destroy software for a living.</Text>

          <chakra.hr borderColor="magenta.700" />
        </Box>
      </Flex>

      <Box mt={3}>
        <Text color="magenta.300">My speciality is building great software that looks good inside-out.</Text>
      </Box>
    </Flex>
  )
}
