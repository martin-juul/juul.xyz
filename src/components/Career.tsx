import * as React from 'react';
import {
  Flex,
  List,
  ListItem,
  ListIcon,
  Heading,
  Text,
  Box,
  Button,
} from '@chakra-ui/react';
import { FaDotCircle } from 'react-icons/all';
import { useState } from 'react';

export function Career() {
  const [selected, setSelected] = useState(0);

  return (
    <Flex justify="center" w="100%" py={2} h="inherit">
      <Box flex={1}>
        <Flex direction="column">
          <Button
            borderColor="magenta.400"
            onClick={() => setSelected(0)}
            w="12rem"
            variant="outline"
            _hover={{bg: 'magenta.300'}}
          >evercall</Button>
          <Button
            borderColor="magenta.400"
            onClick={() => setSelected(1)}
            w="12rem"
            variant="outline"
            mt={4}
            _hover={{bg: 'magenta.300'}}
          >SiteTech</Button>
          <Button
            borderColor="magenta.400"
            onClick={() => setSelected(2)}
            w="12rem"
            variant="outline"
            mt={4}
            _hover={{bg: 'magenta.300'}}
          >Odense Municipalty</Button>
        </Flex>
      </Box>

      <Flex flex={2}>
        {selected === 0 && (
          <Box>
            <Heading size="md">Application Developer</Heading>
            <Text>June 2020 - Current</Text>

            <List mt={2}>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Maintainer of Softphone app on Desktop & Mobile
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Working interesting technologies including React, React Native, Redux, Chakra UI, sip.js, TypeScript
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Extensive knowledge of the SIP protocol and VoIP routing
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                L3 Technical Support
              </ListItem>
            </List>
          </Box>
        )}

        {selected === 1 && (
          <Box>
            <Heading size="md">Technical Lead Developer</Heading>
            <Text>July 2018 - March 2020</Text>

            <List mt={2}>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Write modern, maintainable and performant code for multiple clients and internal use
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Mentoring and code reviewer
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Architected and wrote automated solutions for infra on AWS and operations. Using tools
                such as Terraform.
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Operating and extending Gitlab and Kimai for internal usage
              </ListItem>
            </List>
          </Box>
        )}

        {selected === 2 && (
          <Box>
            <Heading size="md">Developer</Heading>
            <Text>October 2017 - February 2018</Text>

            <List mt={2}>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Developed web based dashboard for internal deployment of Windows AppLocker
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                C# .NET/Entity Framework backend & Angular frontend
              </ListItem>
              <ListItem>
                <ListIcon as={FaDotCircle} color="magenta.300"/>
                Created AutoHotKey macros for scraping internal systems, increasing case worker performance.
              </ListItem>
            </List>
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
