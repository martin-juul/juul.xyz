import * as React from 'react';
import { Box, Flex, Heading, Divider } from '@chakra-ui/react';

export interface SectionProps {
  title: string;
  children?: React.ReactChild
}

export function Section({ title, children }: SectionProps) {

  return (
    <Flex direction="column" mb={8}>
      <Flex align="center">
        <Heading color="magenta.200" size="2xl" fontWeight={700} pr={5}>{title}</Heading>
        <Divider borderColor="magenta.700" />
      </Flex>

      <Box mt={3} pt={8} pb={8}>
        {children}
      </Box>
    </Flex>
  )
}