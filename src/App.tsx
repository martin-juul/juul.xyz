import * as React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { HomeScreen } from './screens/HomeScreen/HomeScreen';
import { theme } from './theme';
import { Sidebar } from './components/Sidebar';

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box position="relative">
      <Sidebar />

      <HomeScreen/>
    </Box>
  </ChakraProvider>
);
