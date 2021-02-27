import * as React from 'react';
import { Box, Button, Container, Flex, FormControl, FormLabel, Input, Text, Textarea } from '@chakra-ui/react';

export function Contact() {
  return (
    <Container>
      <Flex direction="column">

        <Box mb={8} fontWeight={500}>
          <Text>Want to get in touch with me? Drop me a message below.</Text>
        </Box>

        <FormControl>
          <FormLabel>E-Mail</FormLabel>
          <Input type="email"/>
        </FormControl>

        <FormControl mt={2}>
          <FormLabel>Subject</FormLabel>
          <Input type="text" autoComplete="off"/>
        </FormControl>

        <FormControl mt={2}>
          <FormLabel borderColor="magenta">Message</FormLabel>
          <Textarea autoComplete="off"/>
        </FormControl>

        <Button
          mt={2}
          type="submit"
          variant="outline"
          colorScheme="magenta"
          borderColor="magenta.400"
          color="white"
        >Send</Button>
      </Flex>
    </Container>
  );
}
