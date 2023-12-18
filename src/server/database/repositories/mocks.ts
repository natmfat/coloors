import type { IUserPopulated } from "./UserRepository";
import type { IPalettePopulated } from "./PaletteRepository";

// what I expect a user too look like
// also serves as dummy data if I don't connect stuff
export const USER_MOCK: IUserPopulated = {
  id: -1,
  name: "mock",
  email: "mock@gmail.com",
  password: "",
  palettes: [],
};

export const PALETTE_MOCK: IPalettePopulated = {
  id: -1,
  authorId: -1,
  forks: 0,
  colors: "",
  author: USER_MOCK,
};
