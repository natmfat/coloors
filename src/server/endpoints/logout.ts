import express from "express";

/**
 * Apply logout route to the app
 * @param app Express application
 */
export default (app: express.Application) => {
  app.get("/logout", (_, res) => {
    res.clearCookie("token");
    res.redirect("/");
  });
};
