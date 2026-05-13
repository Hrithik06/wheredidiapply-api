import { prisma } from "../lib/prisma.js";
import { CreateUserInput, UpdateUserInput } from "../types/user.js";

/*
  Idempotent login:
  First login → create user
  Next 100 logins → return same user
*/
export async function findOrCreateUser(profile: CreateUserInput) {
  return prisma.user.upsert({
    where: { googleId: profile.googleId },
    update: {
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      givenName: profile.givenName,
      familyName: profile.familyName,
      // scopes handled separately via updateScopes
    },
    create: profile, //create a new user with all profile obj
  });
}

export async function updateScopes(userId: string, scopes: string[]) {
  // fetch only what we need
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { scopes: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const mergedScopes = Array.from(
    new Set([...(user.scopes ?? []), ...(scopes ?? [])]),
  );

  return prisma.user.update({
    where: { id: userId },
    data: {
      scopes: mergedScopes,
    },
  });
}

export async function enableAutomaticTracking(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { automaticTracking: true },
  });
}

export async function saveGmailTokens(
  userId: string,
  accessToken: string,
  refreshToken: string,
  tokenExpiresAt: Date,
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      accessToken,
      refreshToken,
      tokenExpiresAt,
    },
  });
}

export async function getUserByGoogleId(googleId: string) {
  return prisma.user.findUnique({
    where: { googleId },
  });
}

export async function getFullUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
  });
}
export async function getSafeUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      timezone: true,
      timezoneInitialized: true,
      name: true,
      givenName: true,
    },
  });
}
export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
