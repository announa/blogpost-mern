import { readFileSync } from 'fs';

export const getFile = (filePath: string) => {
  try {
    const publicKey = readFileSync(filePath, 'utf-8');
    return publicKey;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
