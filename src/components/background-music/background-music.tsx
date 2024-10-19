export function BackgroundMusic() {
  const sound = require('./buy-mode.mp3');

  return (
    <audio src={sound} autoPlay loop controls />
  );
}
