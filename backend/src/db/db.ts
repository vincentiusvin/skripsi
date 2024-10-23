import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { DB } from "./db_types";

const {
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_PORT: DATABASE_PORT_STR,
  DATABASE_HOST,
  DATABASE_USER,
} = process.env;

const DATABASE_PORT = Number(DATABASE_PORT_STR);

if (
  DATABASE_NAME === undefined ||
  DATABASE_PASSWORD === undefined ||
  DATABASE_PORT === undefined ||
  DATABASE_PORT_STR === undefined ||
  DATABASE_USER === undefined ||
  Number.isNaN(DATABASE_PORT)
) {
  console.log("Database is improperly configured! Make sure all the fields are filled.");
  process.exit(-1);
}

export const dbPool = new Pool({
  database: DATABASE_NAME,
  password: DATABASE_PASSWORD,
  user: DATABASE_USER,
  host: DATABASE_HOST,
  port: DATABASE_PORT,
});

dbPool.connect((err, client, done) => {
  if (err || !client) {
    console.log("Failed to acquire database connection!");
    console.log(err);
    process.exit(-1);
  } else {
    console.log("Database connected!");
  }
  done();
});

const dialect = new PostgresDialect({
  pool: dbPool,
});

export const db = new Kysely<DB>({
  dialect,
  log: ["query"],
});
