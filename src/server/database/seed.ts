import { pool } from "./pool";

async function seed() {
  // create appropriate tables
  await pool.execute(/* sql */ `CREATE TABLE IF NOT EXISTS User (
    id INTEGER AUTO_INCREMENT, 
    name TEXT NOT NULL, 
    email TEXT NOT NULL,
    password TEXT NOT NULL,

    PRIMARY KEY (id)
  )`);

  await pool.execute(/* sql */ `CREATE TABLE IF NOT EXISTS Palette (
    id INTEGER AUTO_INCREMENT, 
    authorId INTEGER NOT NULL,
    forks INTEGER DEFAULT 0 NOT NULL,
    colors TEXT NOT NULL,
    
    PRIMARY KEY (id),
    FOREIGN KEY (authorId) REFERENCES User(id)
  )`);
}

seed().then(async () => {
  await pool.end();
  console.log("[✅] successfully seeded database");
});
