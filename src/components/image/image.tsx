import React from 'react';
import './image.css';

interface Props {
  src: string;
  maxWidth: number;
  alt?: string;
}

export function Image({src, alt, maxWidth}: Props) {
  const maxW = maxWidth + 'px';

  return (
    <div
      className="app-image"
      style={{maxWidth: maxW}}
    >
      <img
        src={src}
        alt={alt}
      />
    </div>
  );
}