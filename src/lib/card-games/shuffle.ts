// Seeded random number generation and shuffling utilities

/**
 * Creates a seeded random number generator using Linear Congruential Generator (LCG)
 * @param seed - The initial seed value
 * @returns A function that returns a random number between 0 and 1
 */
export function createSeededRandom(seed: number): () => number {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 214013 + 2531011) % 2147483648;
    return (currentSeed >> 16) / 32768;
  };
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm with a seeded random
 * @param array - The array to shuffle
 * @param random - A random number generator function
 * @returns The shuffled array (same reference)
 */
export function shuffleDeck<T>(array: T[], random: () => number): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
