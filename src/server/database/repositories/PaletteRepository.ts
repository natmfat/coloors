import { ResultSetHeader, RowDataPacket } from "mysql2";
import { UserRepository, type IUser } from "./UserRepository";
import { pool } from "../pool";
import { Palette } from "@generated/graphql";
import { USER_MOCK } from "./mocks";

export interface IPalette {
  id: number;
  authorId: number;
  forks: number;
  colors: string;
}

export interface IPalettePopulated extends IPalette {
  author: IUser;
}

interface IPalettePacket extends RowDataPacket, IPalette {}

export class PaletteRepository {
  static async hydrate(palette: IPalette): Promise<IPalettePopulated> {
    // @audit make the getAll statement automatically fetch users
    // fetching per palette in an array would be super expensive (so we should fetch one time only)
    return {
      ...palette,
      author: await UserRepository.findById(palette.id),
    };
  }

  /**
   * Convert a palette into a GraphQL-friendly form
   * @param palette Palette stored in the table (or enhanced)
   * @returns GQL friendly Palette
   */
  static convertToGQL(palette: IPalettePopulated | IPalette): Palette {
    return {
      ...palette,
      id: palette.id.toString(),
      author: UserRepository.convertToGQL(
        "author" in palette ? palette.author : USER_MOCK
      ),
    };
  }

  static async getAll() {
    return (
      (
        await pool.query<IPalettePacket[]>(/* sql */ `SELECT * FROM Palette`)
      )[0] || []
    );
  }

  static async getAllByUser(authorId: number): Promise<IPalettePacket[]> {
    return (
      await pool.query<IPalettePacket[]>(
        /* sql */ `SELECT P.* FROM Palette P
          JOIN User ON P.authorId = User.id 
          WHERE P.authorId = ?`,
        [authorId]
      )
    )[0];
  }

  static async create(authorId: number, colors: string): Promise<IPalette> {
    const resultSetHeader = (
      await pool.query(
        /* sql */ `INSERT INTO Palette (authorId, colors) VALUES (?, ?)`,
        [authorId, colors]
      )
    )[0] as ResultSetHeader;

    return {
      id: resultSetHeader.insertId,
      authorId,
      forks: 0,
      colors,
    };
  }

  static async remove(id: number) {
    await pool.query(/* sql */ `DELETE FROM Palette WHERE id = ?`, [id]);
  }

  static async updateColors(id: number, colors: string) {
    await pool.query(/* sql */ `UPDATE Palette SET colors = ? WHERE id = ?`, [
      colors,
      id,
    ]);
  }

  static async incrementFork(id: number) {
    await pool.query(
      /* sql */ `UPDATE Palette SET forks = forks + 1 WHERE id = ?`,
      [id]
    );
  }

  static async findById(id: number): Promise<IPalette> {
    return (
      await pool.query<IPalettePacket[]>(
        /* sql */ `SELECT * FROM Palette WHERE id = ? LIMIT 1`,
        [id]
      )
    )[0][0];
  }
}
