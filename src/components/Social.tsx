import * as React from 'react';
import { Flex, Link } from '@chakra-ui/react';
import { AiFillGithub, AiFillLinkedin } from 'react-icons/all';

export function Social() {
  return (
    <Flex direction="column">
      <Link
        href="https://www.linkedin.com/in/martin-juul/"
        isExternal
        _hover={{ color: 'magenta.200' }}
      ><AiFillLinkedin size={32} /></Link>

      <Link
        href="https://github.com/martin-juul/"
        isExternal
        _hover={{ color: 'magenta.200' }}
      ><AiFillGithub size={32} /></Link>
    </Flex>
  )
}