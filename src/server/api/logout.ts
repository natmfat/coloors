import express from "express";

export default (app: express.Application) => {
  app.get("/logout", (_, res) => {
    res.clearCookie("token");
    res.redirect("/");
  });
};
