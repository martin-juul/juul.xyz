// Sound management for Chips Challenge

type SoundType = 'collect' | 'keyPickup' | 'doorOpen' | 'bootPickup' | 'death' | 'levelComplete' | 'slide';

// Sound settings
let soundEnabled = true;
let audioContext: AudioContext | null = null;
const audioCache: Map<SoundType, AudioBuffer> = new Map();

// Initialize audio context (must be done after user interaction)
export function initAudio(): void {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// Toggle sound on/off
export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  return soundEnabled;
}

// Check if sound is enabled
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

// Load audio file
async function loadSound(soundType: SoundType): Promise<void> {
  if (audioCache.has(soundType)) return;

  try {
    const response = await fetch(`/sounds/${soundType}.mp3`);
    if (!response.ok) return;

    const arrayBuffer = await response.arrayBuffer();
    if (audioContext) {
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      audioCache.set(soundType, audioBuffer);
    }
  } catch (error) {
    console.warn(`Failed to load sound: ${soundType}`, error);
  }
}

// Preload all sounds
export async function preloadSounds(): Promise<void> {
  initAudio();
  const soundTypes: SoundType[] = ['collect', 'keyPickup', 'doorOpen', 'bootPickup', 'death', 'levelComplete', 'slide'];
  await Promise.all(soundTypes.map(loadSound));
}

// Play a sound effect
export function playSound(soundType: SoundType): void {
  if (!soundEnabled || !audioContext) return;

  const audioBuffer = audioCache.get(soundType);
  if (!audioBuffer) {
    // Sound not loaded yet, use fallback beep
    playFallbackSound(soundType);
    return;
  }

  try {
    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = audioBuffer;
    gainNode.gain.value = 0.3; // Volume level

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start(0);
  } catch (error) {
    console.warn(`Failed to play sound: ${soundType}`, error);
    playFallbackSound(soundType);
  }
}

// Fallback sound generation using Web Audio API
function playFallbackSound(soundType: SoundType): void {
  if (!soundEnabled || !audioContext) return;

  const now = audioContext.currentTime;

  switch (soundType) {
    case 'collect':
      playBeep(880, 0.1); // High-pitched ding
      break;
    case 'keyPickup':
      playBeep(660, 0.15); // Mid-pitched chime
      setTimeout(() => playBeep(880, 0.1), 100);
      break;
    case 'doorOpen':
      playBeep(220, 0.2); // Low creak
      break;
    case 'bootPickup':
      playBeep(440, 0.1); // Mid shuffle
      break;
    case 'death':
      playBeep(200, 0.5); // Low descending tone
      break;
    case 'levelComplete':
      // Victory fanfare
      playBeep(523, 0.15);
      setTimeout(() => playBeep(659, 0.15), 150);
      setTimeout(() => playBeep(784, 0.2), 300);
      break;
    case 'slide':
      playBeep(1000, 0.05); // Quick whoosh
      break;
  }
}

// Generate simple beep sounds using Web Audio API (fallback if no files)
export function playBeep(frequency: number, duration: number): void {
  if (!soundEnabled || !audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (error) {
    console.warn('Failed to play beep', error);
  }
}
