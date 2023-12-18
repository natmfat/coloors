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

export interface IPaletteHydrated extends IPalette {
  author: IUser;
}

interface IPalettePacket extends RowDataPacket, Omit<IPalette, "colors"> {
  colors: string;
}

export class PaletteRepository {
  /**
   * Convert a palette into a GraphQL-friendly form
   * @param palette Palette stored in the table (or enhanced)
   * @returns GQL friendly Palette
   */
  static convertToGQL(palette: IPaletteHydrated | IPalette): Palette {
    return {
      ...palette,
      id: palette.id.toString(),
      author: UserRepository.convertToGQL(
        "author" in palette ? palette.author : USER_MOCK,
      ),
    };
  }

  static async getAll() {
    return (
      await pool.query<IPalettePacket[]>(/* sql */ `SELECT * FROM Palette`)
    )[0];
  }

  static async getAllByUser(authorId: number): Promise<IPalettePacket[]> {
    return (
      await pool.query<IPalettePacket[]>(
        /* sql */ `SELECT * FROM Palette 
        JOIN User ON Palette.authorId = User.id 
        WHERE Palette.authorId = ?`,
        [authorId],
      )
    )[0];
  }

  static async create(authorId: number, colors: string): Promise<IPalette> {
    const [resultSetHeader] = await pool.query(
      /* sql */ `INSERT INTO Palette (authorId, colors) VALUES (?, ?)`,
      [authorId, colors],
    );

    return {
      id: (resultSetHeader as ResultSetHeader).insertId,
      authorId,
      forks: 0,
      colors,
    };
  }

  static async remove(id: number) {
    await pool.query(/* sql */ `DELETE FROM Palette WHERE id = ?`, [id]);
  }

  static async updateColors(id: number, colors: string) {
    const result = await pool.query(
      /* sql */ `UPDATE Palette SET colors = ? WHERE id = ?`,
      [id, colors],
    );

    console.log(result);
  }

  static async updateForks(id: number) {
    await pool.query(
      /* sql */ `UPDATE Palette SET forks = forks + 1 WHERE id = ?`,
      [id],
    );
  }
}
