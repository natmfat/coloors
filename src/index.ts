import express from "express";
import cookieParser from "cookie-parser";
import path from "path";

import { getAPI } from "./server/api";

const app = express();

app.engine("html", require("ejs").renderFile);
app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

async function main() {
  const api = await getAPI();
  for (const service of api) {
    await service(app);
  }

  app.listen(8080);
}

main();
