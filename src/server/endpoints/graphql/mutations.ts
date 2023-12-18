// https://stackoverflow.com/questions/67830070/graphql-apollo-server-resolvers-arguments-types

import bcrypt from "bcrypt";
import assert from "assert";

import {
  MutationCreatePaletteArgs,
  MutationCreateUserArgs,
  MutationDeletePaletteArgs,
  MutationIncrementForkArgs,
  MutationUpdatePaletteArgs,
  Palette,
  User,
} from "@generated/graphql";
import { UserRepository } from "@server/database/repositories/UserRepository";
import type { Context } from "./context";
import { getAuthorizedUser } from "@server/utils/getAuthorizedUser";
import { PaletteRepository } from "@server/database/repositories/PaletteRepository";
import { getToken } from "@server/utils/getToken";
import { parseId } from "@server/utils/parseId";

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
  assert(user, "User does not exist");

  const palette = await PaletteRepository.create(user.id, colors);

  return PaletteRepository.convertToGQL({
    ...palette,
    author: user,
  });
}

export async function updatePalette(
  _: undefined,
  { id, colors }: MutationUpdatePaletteArgs
): Promise<string> {
  await PaletteRepository.updateColors(parseId(id), colors);

  return colors;
}

export async function incrementFork(
  _: undefined,
  { id }: MutationIncrementForkArgs,
  { req }: Context
): Promise<string> {
  const user = await getAuthorizedUser(getToken(req));
  assert(user, "User does not exist");

  const parsedId = parseId(id);
  const palette = await PaletteRepository.findById(parsedId);
  assert(palette, "Palette does not exist");
  assert(
    palette.authorId === user.id,
    "You are not authorized to perform this action."
  );

  await PaletteRepository.incrementFork(parsedId);

  return id;
}

export async function deletePalette(
  _: undefined,
  { id }: MutationDeletePaletteArgs,
  { req }: Context
): Promise<string> {
  const user = await getAuthorizedUser(getToken(req));
  assert(user, "User does not exist");

  const parsedId = parseId(id);
  const palette = await PaletteRepository.findById(parsedId);
  assert(palette, "Palette does not exist");
  assert(
    palette.authorId === user.id,
    "You are not authorized to perform this action."
  );

  await PaletteRepository.remove(parsedId);

  return id;
}
