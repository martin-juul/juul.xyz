import styles from './image.module.scss';

interface Props {
  src: string;
  maxWidth: number;
  alt?: string;
}

export function Image({src, alt, maxWidth}: Props) {
  const maxW = maxWidth + 'px';

  return (
    <div
      style={{maxWidth: maxW}}
    >
      <img
        className={styles.appImage}
        src={src}
        alt={alt}
      />
    </div>
  );
}
