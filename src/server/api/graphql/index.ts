import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";

import fs from "fs/promises";
import path from "path";

import * as Mutation from "./mutations";
import * as Query from "./queries";
import type { Context } from "./context";

export default async function graphql(app: express.Application) {
  const typeDefs = (
    await fs.readFile(path.resolve(__dirname, "./schema.graphql"), {
      encoding: "utf-8",
    })
  ).toString();

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers: { Mutation, Query },
  });

  await server.start();

  app.use(
    "/graphql",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req, res }): Promise<Context> => ({
        req,
        res,
      }),
    }),
  );
}
