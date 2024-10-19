export function BackgroundMusic() {
  const sound = new URL('./buy-mode.mp3', import.meta.url);

  return (
    <audio src={sound.toString()} autoPlay loop controls/>
  );
}
