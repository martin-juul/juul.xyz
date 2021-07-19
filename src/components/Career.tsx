import * as React from 'react';
import {
  Box,
  Flex,
  List,
  ListItem,
  ListIcon,
  Heading,
} from '@chakra-ui/react';
import { FaDotCircle } from 'react-icons/all';

interface JobPositionProps {
  title: string;
  company: string;
  period: string;
  children?: React.ReactNode;
}

const JobPosition = ({title, company, period, children}: JobPositionProps) => (
  <Box
    bg="magenta.800"
    borderColor="magenta.700"
    borderRadius="lg"
    borderWidth="1px"
    overflow="hidden"
    py={4}
    pl={3}
    w="100%"
    mt={8}
  >
    <Box mt={1} lineHeight="tight">
      <Heading color="magenta.100">{title}</Heading>
    </Box>

    <Box mt={1} fontSize="xl" fontWeight="semibold" as="h4" lineHeight="tight">
      {company}
    </Box>

    <Box mt={1} as="h5">
      {period}
    </Box>

    <Box d="flex" mt="2">
      {children}
    </Box>
  </Box>
);

export function Career() {
  const spacer = 4;

  return (
    <Flex justify="center" w="100%" py={2} direction="column">
      <JobPosition title="Application Developer" company="evercall" period="June 2020 - Current">
        <List mt={2} spacing={spacer}>
          <ListItem>
            <ListIcon as={FaDotCircle} color="magenta.300"/>
            Maintainer of Softphone app on Desktop & Mobile
          </ListItem>
          <ListItem>
            <ListIcon as={FaDotCircle} color="magenta.300"/>
            Working with interesting technologies including React, React Native, Redux, Chakra UI, sip.js, TypeScript & Asterisk PBX
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
      </JobPosition>

      <JobPosition title="Software Developer" company="SiteTech" period="July 2018 - March 2020">
        <List mt={2} spacing={spacer}>
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
      </JobPosition>

      <JobPosition title="Software Developer" company="Odense Municipality" period="October 2017 - February 2018">
        <List mt={2} spacing={spacer}>
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
      </JobPosition>
    </Flex>
  );
}
