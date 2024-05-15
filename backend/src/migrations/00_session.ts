import { Kysely, sql } from "kysely";

/**
 * Ikutin guide dari library connect-pg-simple.
 * Cuma pindahin sql mereka ke dalam bentuk migration.
 *
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");
 */

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE TABLE "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL) WITH (OIDS=FALSE)`.execute(db);

  await sql`ALTER TABLE "session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE`.execute(
    db
  );

  await sql`CREATE INDEX "IDX_session_expire" ON "session" ("expire")`.execute(
    db
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("IDX_session_expire").execute();
  await db.schema.dropTable("session").execute();
}
