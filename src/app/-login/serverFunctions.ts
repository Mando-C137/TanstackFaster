import { z } from "zod";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import {
  clearSession,
  deleteCookie,
  getCookies,
} from "@tanstack/react-start/server";
import type { NewUser } from "@/db/schema";
import { db } from "@/db";
import { users } from "@/db/schema";
import { comparePasswords, hashPassword, setSession } from "@/lib/session";
// import { authRateLimit, signUpRateLimit } from "@/lib/rate-limit";

const authSchema = (formData: FormData) => {
  const data = Object.fromEntries(formData.entries());
  return z
    .object({
      username: z.string().min(1),
      password: z.string().min(1),
    })
    .parse(data);
};

export const signUp = createServerFn({ method: "POST" })
  .inputValidator(authSchema)
  .handler(async ({ data }) => {
    const { username, password } = data;
    // const ip = getRequestHeader("x-real-ip") ?? "local";
    // const rl2 = await signUpRateLimit.limit(ip);
    // if (!rl2.success) {
    //   return {
    //     error: {
    //       code: "AUTH_ERROR",
    //       message: "Too many signups. Try again later",
    //     },
    //   };
    // }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return { error: "Username already taken. Please try again." };
    }

    const passwordHash = await hashPassword(password);

    const newUser: NewUser = {
      username,
      passwordHash,
    };

    const [createdUser] = await db.insert(users).values(newUser).returning();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!createdUser) {
      return { error: "Failed to create user. Please try again." };
    }
    await setSession(createdUser);
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator(authSchema)
  .handler(async ({ data }) => {
    const { username, password } = data;
    // const ip = getRequestHeader("x-real-ip") ?? "local";
    // const rl = await authRateLimit.limit(ip);

    // if (!rl.success) {
    //   return {
    //     error: {
    //       code: "AUTH_ERROR",
    //       message: "Too many attempts. Try again later",
    //     },
    //   };
    // }
    const user = await db
      .select({
        user: users,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (user.length === 0) {
      return { error: "Invalid username or password. Please try again." };
    }

    const { user: foundUser } = user[0];

    const isPasswordValid = await comparePasswords(
      password,
      foundUser.passwordHash,
    );

    if (!isPasswordValid) {
      return { error: "Invalid username or password. Please try again." };
    }
    await setSession(foundUser);
  });

export const signOut = createServerFn({ method: "POST" }).handler(() => {
  // clear session & cart
  const c = getCookies();

  Object.keys(c).forEach((cookie) => deleteCookie(cookie));
  clearSession({});
});
