import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'kostlife_super_secret_jwt_key_fallback';
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function createSessionToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUserFromCookie() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('kostlife_token')?.value;
    if (!token) return null;
    const verified = await verifySessionToken(token);
    return verified;
  } catch (error) {
    return null;
  }
}
