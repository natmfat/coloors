import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PaletteRepository, type IPalette } from "./PaletteRepository";
import { pool } from "../pool";
import { User } from "@generated/graphql";
import { USER_MOCK } from "./mocks";

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
}

export interface IUserPopulated extends IUser {
  palettes: IPalette[];
}

interface IUserPacket extends IUser, RowDataPacket {}

export class UserRepository {
  /**
   * Retrieve the palettes associated with a given user
   * @param user User stored in table
   * @returns User with palettes
   */
  static async hydrate(user: IUser): Promise<IUserPopulated> {
    return {
      ...user,
      palettes: await PaletteRepository.getAllByUser(user.id),
    };
  }

  /**
   * Convert a user into a GraphQL-friendly form
   *
   * @link https://stackoverflow.com/questions/47874344/should-i-handle-a-graphql-id-as-a-string-on-the-client
   * @param looseUser User stored in the table (or enhanced)
   * @returns GQL friendly User
   */
  static convertToGQL(looseUser: IUserPopulated | IUser): User {
    // instead of hydrating IUser we just fill in missnig values with MOCK
    // this is much cheaper and easier to work around (even if it provides dummy data)
    const { password, ...user } = Object.assign(
      {},
      USER_MOCK,

      // dubbed loose because the typing is loose
      looseUser
    ) as IUserPopulated;

    return {
      ...user,
      id: user.id.toString(),

      // here we set palettes to an empty array to limit depth to 1
      // prevents infinite recursion
      palettes: user.palettes
        .map((palette) => ({ ...palette, author: { ...user, palettes: [] } }))
        .map(PaletteRepository.convertToGQL),
    };
  }

  static async create(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    const resultSetHeader = (
      await pool.query(
        /* sql */ `INSERT INTO User (name, email, password) VALUES (?, ?, ?)`,
        [name, email, password]
      )
    )[0] as ResultSetHeader;

    return {
      id: resultSetHeader.insertId,
      name,
      email,
      password,
    };
  }

  static async findByEmail(email: string): Promise<IUser> {
    return (
      await pool.query<IUserPacket[]>(
        /* sql */ `SELECT * FROM User WHERE email = ? LIMIT 1`,
        [email]
      )
    )[0][0];
  }

  static async findById(id: number): Promise<IUser> {
    return (
      await pool.query<IUserPacket[]>(
        /* sql */ `SELECT * FROM User WHERE id = ? LIMIT 1`,
        [id]
      )
    )[0][0];
  }
}
