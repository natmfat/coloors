import { verify } from "jsonwebtoken";
import assert from "assert";

import {
  IUser,
  UserRepository,
} from "@server/database/repositories/UserRepository";

/**
 * Verify the JWT token and find the user's detail
 * @param token JWT token, should be used with getToken
 * @returns User, if found
 */
export function getAuthorizedUser(token: string): Promise<IUser> {
  const payload = verify(token, `${process.env.JWT_SECRET}`);
  assert(typeof payload === "object");

  return UserRepository.findByEmail(payload.email);
}
