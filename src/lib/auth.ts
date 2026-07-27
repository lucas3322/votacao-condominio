import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "condominio_master";
const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "troque-esta-chave-em-producao");

export async function createAdminSession() {
  const token = await new SignJWT({ role: "master" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function isAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "master";
  } catch {
    return false;
  }
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}
