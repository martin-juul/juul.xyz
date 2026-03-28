// Password system for Chips Challenge

// Generate a 4-character password for a level
export function generatePassword(level: number): string {
  // Simple password generation based on level number
  // Using a deterministic algorithm so the same level always generates the same password
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars (I, O, 0, 1)
  let result = '';

  for (let i = 0; i < 4; i++) {
    const seed = level * (i + 1) * 17 + i * 13;
    const index = seed % chars.length;
    result += chars[index];
  }

  return result;
}

// Validate a password and return the level number
export function validatePassword(password: string, maxLevel: number): number | null {
  if (password.length !== 4) return null;

  const upperPassword = password.toUpperCase();

  // Check all levels up to maxLevel
  for (let level = 1; level <= maxLevel; level++) {
    if (generatePassword(level) === upperPassword) {
      return level;
    }
  }

  return null;
}

// Generate password with checksum (more secure)
export function generateSecurePassword(level: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';

  // First 3 chars based on level
  for (let i = 0; i < 3; i++) {
    const seed = level * (i + 1) * 17 + i * 13;
    const index = seed % chars.length;
    result += chars[index];
  }

  // 4th char is a simple checksum
  const checksum = level % chars.length;
  result += chars[checksum];

  return result;
}

// Validate secure password
export function validateSecurePassword(password: string, maxLevel: number): number | null {
  if (password.length !== 4) return null;

  const upperPassword = password.toUpperCase();

  for (let level = 1; level <= maxLevel; level++) {
    if (generateSecurePassword(level) === upperPassword) {
      return level;
    }
  }

  return null;
}
