import * as React from 'react';
import { ChakraProvider, Box, Container } from '@chakra-ui/react';
import { HomeScreen } from './screens/HomeScreen/HomeScreen';
import { theme } from './theme';
import { Sidebar } from './components/Sidebar';

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box position="relative">
      <Sidebar />

      <Container maxW="container.lg">
        <HomeScreen/>
      </Container>

    </Box>
  </ChakraProvider>
);
