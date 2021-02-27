import * as React from 'react';
import { Box, Button, Container, FormControl, FormLabel, Input, Text, Textarea, chakra } from '@chakra-ui/react';

export function Contact() {
  return (
    <Container mt={10} mb={10}>
      <chakra.form
        d="flex"
        flexDirection="column"
        method="post"
        action="https://send.pageclip.co/XXb20PtxGWiDxWkp93Lvw20mXhmnIUpd/contact-form"
      >

        <Box mb={8} fontWeight={500}>
          <Text>Want to get in touch with me? Drop me a message below.</Text>
        </Box>

        <FormControl borderColor="magenta.300">
          <FormLabel>E-Mail</FormLabel>
          <Input name="email" type="email" required/>
        </FormControl>

        <FormControl mt={4} borderColor="magenta.300">
          <FormLabel>Subject</FormLabel>
          <Input name="subject" type="text" autoComplete="off" required/>
        </FormControl>

        <FormControl mt={4} borderColor="magenta.300">
          <FormLabel>Message</FormLabel>
          <Textarea autoComplete="off" required minLength={50} name="body"/>
        </FormControl>

        <Button
          className="pageclip-form__submit"
          mt={2}
          type="submit"
          variant="outline"
          colorScheme="magenta"
          borderColor="magenta.400"
          color="white"
          _hover={{bg: 'magenta.300'}}
        >Send</Button>
      </chakra.form>
    </Container>
  );
}
