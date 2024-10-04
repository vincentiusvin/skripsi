import { Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_comments")
    .addColumn("article_id", "integer", (build) =>
      build.references("ms_articles.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("user_id", "integer", (build) =>
      build.references("ms_users.id").notNull().onDelete("cascade").onUpdate("cascade"),
    )
    .addColumn("comment_id", "serial", (build) => build.primaryKey())
    .addColumn("comment", "text", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) => col.defaultTo(sql`NOW()`).notNull())
    .addForeignKeyConstraint("comments_article_fk", ["article_id"], "ms_articles", ["id"], (fk) =>
      fk.onDelete("cascade"),
    )
    .addForeignKeyConstraint("comments_user_fk", ["user_id"], "ms_users", ["id"], (fk) =>
      fk.onDelete("cascade"),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_comments").execute();
}
