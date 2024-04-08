import { promises as fs } from "fs";
import { FileMigrationProvider, Migrator } from "kysely";
import path from "path";
import { db } from "./db";

async function migrateToLatest() {
  const migrator = new Migrator({
    db: db,
    provider: new FileMigrationProvider({
      fs: fs,
      path: path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "./migrations"),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(
        `migration "${it.migrationName}" was ${
          it.direction === "Up" ? "executed" : "rollbacked"
        } successfully`
      );
    } else if (it.status === "Error") {
      console.error(
        `failed to ${
          it.direction === "Up" ? "execute" : "rollback"
        } migration "${it.migrationName}"`
      );
    }
  });

  if (error) {
    console.error("failed to migrate");
    console.error(error);
    process.exit(1);
  }

  await db.destroy();
}

migrateToLatest();
