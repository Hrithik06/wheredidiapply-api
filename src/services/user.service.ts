import { prisma } from "../lib/prisma.js";

/*
  Idempotent login:
  First login → create user
  Next 100 logins → return same user
*/

export async function findOrCreateUser(profile: {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
  scopes?: string[];
}) {
  let user = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: profile,
    });
  }

  return user;
}
export async function updateScopes(googleId: string, scopes: string[]) {
  let user = await prisma.user.findUnique({
    where: { googleId },
  });
  if (!user) {
    return null;
  }
  const mergedScopes = Array.from(
    new Set([...(user.scopes ?? []), ...(scopes ?? [])]),
  );

  const updatedUser = await prisma.user.update({
    where: { googleId },
    data: {
      scopes: mergedScopes,
    },
  });
}
export async function enableAutomaticTracking(googleId: string) {
  return prisma.user.update({
    where: { googleId },
    data: { automaticTracking: true },
  });
}

export async function saveGmailTokens(
  googleId: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiresAt: Date,
) {
  let user = await prisma.user.findUnique({
    where: { googleId },
  });
  if (!user) {
    return null;
  }
  const updatedUser = await prisma.user.update({
    where: { googleId },
    data: {
      accessToken,
      refreshToken,
      tokenExpiresAt,
    },
  });
  // return updatedUser;
}

export async function getUser(googleId: string) {
  let user = await prisma.user.findUnique({
    where: { googleId },
  });
  if (!user) {
    return null;
  }
  return user;
}
export function getAllUsers() {
  return prisma.user.findMany();
}
