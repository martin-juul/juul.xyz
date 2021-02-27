import * as React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Social } from './Social';

export function Sidebar() {
  return (
    <Flex direction="column" h="99vh" position="absolute" left={0}>
      <Box mt="auto">
        <Social />
      </Box>
    </Flex>
  )
}