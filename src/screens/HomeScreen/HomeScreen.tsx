import * as React from 'react';
import ReactGA from 'react-ga';
import { Container } from '@chakra-ui/react';
import { About } from '../../components/About';
import { Section } from '../../components/Section';
import { Career } from '../../components/Career';
import { Introduction } from '../../components/Introduction';
import { useLayoutEffect } from 'react';
import { Contact } from '../../components/Contact';

export function HomeScreen() {
  useLayoutEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search, [], 'Home');
  }, []);

  return (
    <Container maxW="8xl" p={0}>
      <Introduction/>

      <Section title="Who?">
        <About/>
      </Section>

      <Section title="Career">
        <Career/>
      </Section>

      <Section title="Contact">
        <Contact />
      </Section>
    </Container>
  );
}
