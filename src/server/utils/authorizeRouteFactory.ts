import express from "express";

import { getAuthorizedUser } from "./getAuthorizedUser";
import { getToken } from "./getToken";
import {
  IUserPopulated,
  UserRepository,
} from "@server/database/repositories/UserRepository";

export function authorizeRouteFactory(requireAuth: boolean = false) {
  return async (
    req: express.Request,
    res: express.Response,
    next: () => void
  ) => {
    let user: IUserPopulated | undefined = undefined;

    try {
      user = await UserRepository.hydrate(
        await getAuthorizedUser(getToken(req))
      );
    } catch (error) {}

    if (requireAuth && !user) {
      res.redirect("/");
      return;
    }

    res.locals.user = user;
    next();
  };
}
