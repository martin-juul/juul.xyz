import * as React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Social } from './Social';

export function Sidebar() {
  return (
    <Flex
      direction="column"
      h="99vh"
      position="fixed"
      left="10px"
    >
      <Box mt="auto">
        <Social />
      </Box>
    </Flex>
  )
}
