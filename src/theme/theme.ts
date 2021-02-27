import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  colors:
    {
      magenta: {
        50: '#f8e4ff',
        100: '#e0b4ff',
        200: '#c983fc',
        300: '#b152f9',
        400: '#9b22f6',
        500: '#8209dd',
        600: '#6505ad',
        700: '#48037d',
        800: '#2b014d',
        900: '#10001f',
      },
    },
  styles: {
    global: {
      body: {
        bg: 'magenta.900',
        color: 'gray.200',
        fontWeight: 500,
        fontSize: '1.2rem',
      },
    },
  },
});
