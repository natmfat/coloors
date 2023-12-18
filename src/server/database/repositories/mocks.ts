import type { IUserHydrated } from "./UserRepository";
import type { IPaletteHydrated } from "./PaletteRepository";

export const USER_MOCK: IUserHydrated = {
  id: -1,
  name: "mock",
  email: "mock@gmail.com",
  password: "",
  palettes: [],
};

export const PALETTE_MOCK: IPaletteHydrated = {
  id: -1,
  authorId: -1,
  forks: 0,
  colors: "",
  author: USER_MOCK,
};
