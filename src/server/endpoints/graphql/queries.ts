import { sign } from "jsonwebtoken";
import { compare } from "bcrypt";
import assert from "assert";

import { User, Palette, QueryLoginUserArgs } from "@generated/graphql";
import type { Context } from "./context";

import { PaletteRepository } from "@server/database/repositories/PaletteRepository";
import { UserRepository } from "@server/database/repositories/UserRepository";
import { getToken } from "@server/utils/getToken";
import { getAuthorizedUser } from "@server/utils/getAuthorizedUser";

/**
 * Get all palettes in the database
 */
export async function getAllPalettes(): Promise<Palette[]> {
  return (await PaletteRepository.getAll()).map(PaletteRepository.convertToGQL);
}

/**
 * Get the currently logged in user
 */
export async function getUser(
  _: undefined,
  __: undefined,
  { req }: Context
): Promise<User> {
  return UserRepository.convertToGQL(
    await UserRepository.hydrate(await getAuthorizedUser(getToken(req)))
  );
}

/**
 * Log in the user \
 * Not really sure if this belongs in GQL (it does have a cookie side effect too)
 */
export async function loginUser(
  _: undefined,
  { email, password }: QueryLoginUserArgs,
  { res }: Context
): Promise<User> {
  // find the user and see if the passwords match
  const user = await UserRepository.findByEmail(email);
  const authorized = user && (await compare(password, user.password));
  assert(authorized, "Failed to authorize user");

  // create & save the token into cookies
  const token = sign({ email }, `${process.env.JWT_SECRET}`, {
    algorithm: "HS512",
    expiresIn: new Date().getTime() * 60 * 60 * 1000,
  });

  res.cookie("token", token, { httpOnly: true, secure: true });

  return {
    ...UserRepository.convertToGQL(await UserRepository.hydrate(user)),
    token,
  };
}

/**
 * Log out the user \
 * Method is also duplicated in endpoints/logout.ts
 */
export function logoutUser(
  _: undefined,
  __: undefined,
  { res, req }: Context
): string {
  const invalidatedToken = getToken(req);
  res.clearCookie("token");
  return invalidatedToken;
}
