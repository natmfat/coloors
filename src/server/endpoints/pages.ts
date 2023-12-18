import { PaletteRepository } from "@server/database/repositories/PaletteRepository";
import { UserRepository } from "@server/database/repositories/UserRepository";
import { authorizeRouteFactory } from "@server/utils/authorizeRouteFactory";
import express from "express";

export default async function home(app: express.Application) {
  app.get("/", authorizeRouteFactory(false), async (_, res) => {
    res.render("index.ejs", {
      palettes: ((await PaletteRepository.getAll()) || []).sort(
        (a, b) => b.forks - a.forks
      ),
    });
  });

  app.get("/~", authorizeRouteFactory(true), (_, res) => {
    res.render("dashboard.ejs", {
      palettes: res.locals.user.palettes,
    });
  });

  app.get("/generate", authorizeRouteFactory(), (_, res) => {
    res.render("generate.ejs");
  });

  app.get("/generate/:id", authorizeRouteFactory(), async (req, res) => {
    const paletteId = parseInt(req.params.id);
    if (!paletteId || isNaN(paletteId)) {
      return res.status(404).render("error.ejs", { error: 404 });
    }

    const palette = await PaletteRepository.findById(paletteId);
    if (!palette) {
      return res.status(404).render("error.ejs", { error: 404 });
    }

    res.render("generate.ejs", { palette });
  });

  app.get("/u/:id", authorizeRouteFactory(), async (req, res) => {
    const userId = parseInt(req.params.id);
    if (!userId || isNaN(userId)) {
      return res.status(404).render("error.ejs", { error: 404 });
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(404).render("error.ejs", { error: 404 });
    }

    res.render("user.ejs", { profile: await UserRepository.hydrate(user) });
  });
}
