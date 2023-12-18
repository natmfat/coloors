import { sign } from "jsonwebtoken";
import { compare } from "bcrypt";
import assert from "assert";

import { User, QueryLoginUserArgs } from "@generated/graphql";
import type { Context } from "./context";

import { PaletteRepository } from "@server/database/repositories/PaletteRepository";
import { UserRepository } from "@server/database/repositories/UserRepository";
import { getToken } from "@server/utils/getToken";

export function getAllPalettes() {
  return PaletteRepository.getAll();
}

export async function loginUser(
  _: undefined,
  { email, password }: QueryLoginUserArgs,
  { res }: Context
): Promise<User> {
  const user = await UserRepository.findByEmail(email);
  const authorized = user && (await compare(password, user.password));
  assert(authorized, "Failed to authorize user");

  const expiresIn = new Date().getTime() * 60 * 60 * 1000;
  const token = sign({ email }, `${process.env.JWT_SECRET}`, {
    algorithm: "HS512",
    expiresIn,
  });

  res.cookie("JWT_TOKEN", token, {
    httpOnly: true,
    secure: true,
  });

  return {
    ...UserRepository.convertToGQL(await UserRepository.hydrate(user)),
    token,
  };
}

export function logoutUser(_: undefined, __: undefined, { res, req }: Context) {
  const invalidatedToken = getToken(req);
  res.clearCookie("JWT_TOKEN");
  return invalidatedToken;
}
