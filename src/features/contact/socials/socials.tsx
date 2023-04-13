import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import './socials.css';

export function Socials() {
  const color = '#c0c7cb';
  const size = 36;

  return (
    <div className="socials mt-1 mb-1 text-right">
      <a href="https://github.com/martin-juul" aria-label="Github" target="_blank" rel="noreferrer nofollow">
        <Github color={color} size={size} />
      </a>
      <a href="https://www.linkedin.com/in/martin-juul/" aria-label="Linkedin" target="_blank" rel="noreferrer nofollow">
        <Linkedin color={color} size={size} />
      </a>
    </div>
  )
}