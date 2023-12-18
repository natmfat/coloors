import express from "express";

export default function error404(app: express.Application) {
  app.use((_, res) => {
    res.status(404).render("error.ejs", { error: 404 });
  });
}
