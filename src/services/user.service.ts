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

export function getAllUsers() {
  return prisma.user.findMany();
}
