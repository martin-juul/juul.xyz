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
        alt="My linkedin profile"
      ><AiFillLinkedin size={48} /></Link>

      <Link
        href="https://github.com/martin-juul/"
        isExternal
        _hover={{ color: 'magenta.200' }}
        mt={2}
        alt="My Github profile"
      ><AiFillGithub size={48} /></Link>
    </Flex>
  )
}
