import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("ms_preferences")
    .addColumn("user_id", "integer", (build) =>
      build
        .references("ms_users.id")
        .notNull()
        .onDelete("cascade")
        .onUpdate("cascade")
        .primaryKey(),
    )
    .addColumn("project_invite", "boolean", (eb) => eb.notNull().defaultTo(true))
    .addColumn("friend_invite", "boolean", (eb) => eb.notNull().defaultTo(true))
    .addColumn("project_notif", "text", (eb) => eb.notNull().defaultTo("on"))
    .addColumn("org_notif", "text", (eb) => eb.notNull().defaultTo("on"))
    .addColumn("msg_notif", "text", (eb) => eb.notNull().defaultTo("on"))
    .addColumn("report_notif", "text", (eb) => eb.notNull().defaultTo("on"))
    .addColumn("task_notif", "text", (eb) => eb.notNull().defaultTo("on"))
    .addColumn("contrib_notif", "text", (eb) => eb.notNull().defaultTo("on"))
    .addColumn("friend_notif", "text", (eb) => eb.notNull().defaultTo("on"))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("ms_preferences").execute();
}
