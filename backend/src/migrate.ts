import { promises as fs } from "fs";
import { FileMigrationProvider, Migrator, NO_MIGRATIONS } from "kysely";
import path from "path";
import { db } from "./db/db";

const ARGS = ["latest", "down", "up", "init"] as const;

async function migrate(option: (typeof ARGS)[number]) {
  const migrator = new Migrator({
    db: db,
    provider: new FileMigrationProvider({
      fs: fs,
      path: path,
      // This needs to be an absolute path.
      migrationFolder: path.join(__dirname, "./migrations"),
    }),
  });

  let migrationResult;
  if (option == "init") {
    migrationResult = await migrator.migrateTo(NO_MIGRATIONS);
  } else if (option == "down") {
    migrationResult = await migrator.migrateDown();
  } else if (option == "up") {
    migrationResult = await migrator.migrateUp();
  } else {
    migrationResult = await migrator.migrateToLatest();
  }

  const { error, results } = migrationResult;

  results?.forEach((it) => {
    if (it.status === "Success") {
      console.log(
        `migration "${it.migrationName}" was ${
          it.direction === "Up" ? "executed" : "rollbacked"
        } successfully`,
      );
    } else if (it.status === "Error") {
      console.error(
        `failed to ${
          it.direction === "Up" ? "execute" : "rollback"
        } migration "${it.migrationName}"`,
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

migrate("latest");
