import { Application } from "express";
import path from "path";
import fs from "fs/promises";
import { pathToFileURL } from "node:url";

type Service = (app: Application) => Promise<void> | void;

/**
 * Get all of the files in the api directory
 * @returns List of services that attach listeners to the Express app
 */
export async function getAPI() {
  const files = await fs.readdir(__dirname);
  const services = files
    .filter((file) => file !== "index.ts")
    .map(async (file) => {
      const resolvedPath = path.resolve(__dirname, file);
      const importPath = (await fs.stat(resolvedPath)).isFile()
        ? resolvedPath
        : path.resolve(resolvedPath, "index.ts");

      // c: isn't a valid import path on windows
      // so we have to convert it into a file URL
      // https://nodejs.org/api/url.html#url_url_pathtofileurl_path
      const module = await import(pathToFileURL(importPath).toString());
      return module.default as Service;
    });

  return await Promise.all(services);
}
