import { Kysely, MysqlDialect } from "kysely";
import { DB } from "kysely-codegen";
import { createPool } from "mysql2";
import { loadEnv } from "./env";

loadEnv();

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
  console.log(
    "Database is improperly configured! Make sure all the fields are filled."
  );
  process.exit(-1);
}

const connectionPool = createPool({
  database: DATABASE_NAME,
  password: DATABASE_PASSWORD,
  user: DATABASE_USER,
  host: DATABASE_HOST,
  port: DATABASE_PORT,
});

connectionPool.getConnection((err, conn) => {
  if (err) {
    console.log("Failed to acquire database connection!");
    console.log(err);
    process.exit(-1);
  } else {
    console.log("Database connected!");
  }
  connectionPool.releaseConnection(conn);
});

const dialect = new MysqlDialect({
  pool: connectionPool,
});

export const db = new Kysely<DB>({
  dialect,
});
