import express from "express";

/**
 * Apply the 404 error route to the app
 * @param app Express application
 */
export default function error404(app: express.Application) {
  app.use((_, res) => {
    res.status(404).render("error.ejs", { error: 404 });
  });
}
