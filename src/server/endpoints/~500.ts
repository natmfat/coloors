import express from "express";

/**
 * Apply the 500 error route to the app
 * @param app Express application
 */
export default function error500(app: express.Application) {
  app.use((_, res) => {
    res.status(500).render("error.ejs", { error: 500 });
  });
}
