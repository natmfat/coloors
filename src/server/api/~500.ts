import express from "express";

export default function error500(app: express.Application) {
  app.use((_, res) => {
    res.status(500).render("error.ejs", { error: 500 });
  });
}
