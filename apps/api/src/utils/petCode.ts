import prisma from '../config/database';

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_LENGTH = 6;
const PREFIX = 'PET';

/**
 * Generate a random string of uppercase alphanumeric characters.
 */
function generateRandomCode(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return result;
}

/**
 * Generate a unique PET-XXXXXX code.
 * Checks the database to ensure no collisions.
 * Retries up to 10 times before throwing.
 */
export async function generatePetCode(): Promise<string> {
  const maxRetries = 10;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const code = `${PREFIX}-${generateRandomCode(CODE_LENGTH)}`;

    const existing = await prisma.pet.findUnique({
      where: { petCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error('Failed to generate a unique pet code after maximum retries');
}

/**
 * Validate pet code format.
 */
export function isValidPetCode(code: string): boolean {
  return /^PET-[A-Z0-9]{6}$/.test(code);
}
