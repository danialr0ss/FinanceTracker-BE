import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
const saltRounds = 10;

export async function hashPassword(password: string): Promise<string> {
  try {
    return bcrypt.hash(password, saltRounds);
  } catch (err) {
    throw new InternalServerErrorException('Error hashing password');
  }
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (err) {
    throw new InternalServerErrorException('Error comparing hashes');
  }
}
