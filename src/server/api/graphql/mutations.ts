// https://stackoverflow.com/questions/67830070/graphql-apollo-server-resolvers-arguments-types

import bcrypt from "bcrypt";
import assert from "assert";

import {
  MutationCreatePaletteArgs,
  MutationCreateUserArgs,
  MutationUpdatePaletteArgs,
  Palette,
  User,
} from "@generated/graphql";
import { UserRepository } from "@server/database/repositories/UserRepository";
import type { Context } from "./context";
import { getAuthorizedUser } from "@server/utils/getAuthorizedUser";
import {
  IPaletteHydrated,
  PaletteRepository,
} from "@server/database/repositories/PaletteRepository";
import { getToken } from "@server/utils/getToken";

export async function createUser(
  _: undefined,
  { name, email, password }: MutationCreateUserArgs
): Promise<User> {
  const existingUser = await UserRepository.findByEmail(email);
  assert(!existingUser, "A user with the same email already exists.");

  return UserRepository.convertToGQL({
    ...(await UserRepository.create(
      name,
      email,
      await bcrypt.hash(password, 10)
    )),
  });
}

export async function createPalette(
  _: undefined,
  { colors }: MutationCreatePaletteArgs,
  { req }: Context
): Promise<Palette> {
  const user = await getAuthorizedUser(getToken(req));
  const palette = await PaletteRepository.create(user.id, colors);

  return PaletteRepository.convertToGQL({
    ...palette,
    author: user,
  });
}

export function updatePalette(
  _: undefined,
  { id: unparsedId, colors }: MutationUpdatePaletteArgs,
  { req }: Context
) {
  return PaletteRepository.updateColors(parseInt(unparsedId), colors);
}

export function incrementFork() {}

export function deletePalette() {}
