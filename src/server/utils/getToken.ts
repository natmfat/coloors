import assert from "assert";
import express from "express";

/**
 * Extract the JWT token from the authorization header or token cookie
 * @param req Express request object
 * @returns Token, if any
 */
export function getToken(req: express.Request): string {
  const authorizationHeader = req.headers.authorization
    ?.toString()
    .replace("Bearer", "")
    .trim();

  const token = authorizationHeader || req.cookies.token;
  assert(token && typeof token === "string", "No user token found");

  return token;
}
