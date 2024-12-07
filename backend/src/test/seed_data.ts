import { faker } from "@faker-js/faker";
import { hashSync } from "bcryptjs";
import { randomBytes } from "crypto";
import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

function looper<T>(times: number, func: (i: number) => T) {
  const ret: T[] = [];
  for (let i = 0; i < times; i++) {
    ret.push(func(i));
  }
  return ret;
}

async function addFriends(db: Kysely<DB>) {
  const friends_to_generate = 5000;

  const users = await db.selectFrom("ms_users").select("id").execute();

  const pairings_raw = faker.helpers.uniqueArray(
    () =>
      faker.helpers
        .arrayElements(users, 2)
        .map((x) => x.id)
        .sort((a, b) => a - b)
        .join("-"), // dia kerjanya pakai Set
    friends_to_generate,
  );

  const pairings = pairings_raw.map((x) => x.split("-").map((str) => Number(str)));

  await db
    .insertInto("ms_friends")
    .values(
      pairings.map(([user1, user2]) => {
        const flip = faker.datatype.boolean();
        return {
          from_user_id: flip ? user1 : user2,
          to_user_id: flip ? user2 : user1,
          status: faker.helpers.arrayElement(["Accepted", "Pending"]),
        };
      }),
    )
    .execute();
}

async function addTasks(db: Kysely<DB>) {
  const tasks_to_generate = 5000;

  const projects = await db.selectFrom("ms_projects").select("id").execute();
  const users = await db.selectFrom("ms_users").select("id").execute();
  const cats = ["Backlog", "Doing", "Done"];

  const buckets = await db
    .insertInto("ms_task_buckets")
    .values(
      projects.flatMap(({ id }) => {
        return cats.map((x) => ({
          project_id: id,
          name: x,
        }));
      }),
    )
    .returning("id")
    .execute();

  const tasks = await db
    .insertInto("ms_tasks")
    .values(
      looper(tasks_to_generate, () => {
        return {
          bucket_id: faker.helpers.arrayElement(buckets).id,
          name: faker.commerce.productName(),
          description: faker.hacker.phrase(),
          order: faker.number.int({
            min: 0,
            max: 10000,
          }),
          start_at: faker.helpers.maybe(() => faker.date.past()),
          end_at: faker.helpers.maybe(() => faker.date.future()),
        };
      }),
    )
    .returning("id")
    .execute();

  await db
    .insertInto("tasks_users")
    .values(
      tasks.flatMap(({ id }) => {
        const assignees = faker.helpers
          .arrayElements(users, {
            min: 0,
            max: 5,
          })
          .map((x) => x.id);

        return assignees.map((user_id) => ({
          task_id: id,
          user_id,
        }));
      }),
    )
    .execute();
}

async function addReports(db: Kysely<DB>) {
  const report_to_gen = 500;
  const users = await db.selectFrom("ms_users").select("id").execute();
  const rooms = await db.selectFrom("ms_chatrooms").select("id").execute();

  await db
    .insertInto("ms_reports")
    .values(
      looper(report_to_gen, () => {
        return {
          title: faker.company.buzzPhrase(),
          description: faker.lorem.paragraph(),
          sender_id: faker.helpers.arrayElement(users).id,
          chatroom_id: faker.helpers.maybe(() => faker.helpers.arrayElement(rooms).id, {
            probability: 0.2,
          }),
          ...(faker.datatype.boolean()
            ? {
                status: faker.helpers.arrayElement(["Rejected", "Resolved"]),
                resolved_at: faker.date.past(),
                resolution: faker.lorem.sentence(),
              }
            : { status: "Pending" }),
        };
      }),
    )
    .execute();
}

async function addBans(db: Kysely<DB>) {
  const users = await db.selectFrom("ms_users").select("id").execute();
  const bans_to_add = 250;
  await db
    .insertInto("ms_suspensions")
    .values(
      looper(bans_to_add, () => ({
        reason: faker.lorem.sentence({ min: 1, max: 5 }),
        suspended_until: faker.date.anytime(),
        user_id: faker.helpers.arrayElement(users).id,
      })),
    )
    .execute();
}

async function addChatrooms(db: Kysely<DB>) {
  const chats_to_gen = 2000;
  const users = await db.selectFrom("ms_users").select("id").execute();
  const projects = await db.selectFrom("ms_projects").select("id").execute();

  const chat_ids = await db
    .insertInto("ms_chatrooms")
    .values(
      looper(chats_to_gen, () => ({
        name: faker.company.buzzPhrase(),
        project_id: faker.helpers.maybe(() => faker.helpers.arrayElement(projects).id),
      })),
    )
    .returning(["id", "ms_chatrooms.project_id"])
    .execute();

  const chat_users = await db
    .insertInto("chatrooms_users")
    .values(
      chat_ids.flatMap(({ id, project_id }) => {
        if (project_id != null) {
          return [];
        }

        const members = faker.helpers.arrayElements(
          users.map((x) => x.id),
          {
            min: 1,
            max: 25,
          },
        );
        return members.map((user_id) => ({
          chatroom_id: id,
          user_id,
        }));
      }),
    )
    .returning(["user_id", "chatroom_id"])
    .execute();

  const messages_to_gen = 50000;
  const batches = 10;

  for (let i = 0; i < batches; i++) {
    const message_ids = await db
      .insertInto("ms_messages")
      .values(
        looper(messages_to_gen / batches, () => {
          const picked = faker.helpers.arrayElement(chat_users);

          return {
            chatroom_id: picked.chatroom_id,
            user_id: picked.user_id,
            message: faker.lorem.paragraph({
              max: 10,
              min: 1,
            }),
            created_at: faker.date.past(),
          };
        }),
      )
      .returning("ms_messages.id")
      .execute();

    await db
      .insertInto("ms_chatroom_files")
      .values(
        message_ids.flatMap(({ id: message_id }) => {
          const has_file = faker.datatype.boolean(0.05);
          if (!has_file) {
            return [];
          }

          const files_to_add = faker.number.int({
            min: 1,
            max: 5,
          });

          return looper(files_to_add, () => ({
            filename: faker.system.commonFileName(),
            content: randomBytes(
              faker.number.int({
                min: 1,
                max: 10000,
              }),
            ),
            message_id,
          }));
        }),
      )
      .execute();
  }
}

async function addContribs(db: Kysely<DB>) {
  const contribs_to_add = 2000;
  const users = await db.selectFrom("ms_users").select("id").execute();
  const projects = await db.selectFrom("ms_projects").select("id").execute();

  const contrib_id = await db
    .insertInto("ms_contributions")
    .values(
      looper(contribs_to_add, () => ({
        name: faker.hacker.adjective() + " " + faker.hacker.noun(),
        project_id: faker.helpers.arrayElement(projects).id,
        status: faker.helpers.arrayElement(["Approved", "Pending", "Revision", "Rejected"]),
        description: faker.lorem.paragraphs(10),
      })),
    )
    .returning("id")
    .execute();

  await db
    .insertInto("ms_contributions_users")
    .values(
      contrib_id.flatMap(({ id }) => {
        const members = faker.helpers.arrayElements(
          users.map((x) => x.id),
          {
            min: 1,
            max: 8,
          },
        );

        return members.map((user_id) => ({
          contributions_id: id,
          user_id,
        }));
      }),
    )
    .execute();
}

async function addProjects(db: Kysely<DB>) {
  const projects_to_gen = 300;

  const users = await db.selectFrom("ms_users").select("id").execute();
  const orgs = await db.selectFrom("ms_orgs").select("id").execute();
  const cats = await db.selectFrom("ms_category_projects").select("id").execute();

  const project_ids = await db
    .insertInto("ms_projects")
    .values(
      looper(projects_to_gen, () => ({
        description: faker.company.buzzPhrase(),
        name: faker.internet.domainWord(),
        content: faker.lorem.paragraphs(10),
        org_id: faker.helpers.arrayElement(orgs).id,
        archived: faker.datatype.boolean(0.25),
      })),
    )
    .returning("id")
    .execute();

  await db
    .insertInto("projects_users")
    .values(
      project_ids.flatMap(({ id }) => {
        const members = faker.helpers.arrayElements(
          users.map((x) => x.id),
          {
            min: 0,
            max: 50,
          },
        );

        return members.map((user_id) => ({
          project_id: id,
          role: faker.helpers.arrayElement(["Admin", "Dev", "Invited", "Pending"]),
          user_id,
        }));
      }),
    )
    .execute();

  await db
    .insertInto("categories_projects")
    .values(
      project_ids.flatMap(({ id: project_id }) => {
        const cat = faker.helpers.arrayElements(cats);
        return cat.map(({ id: category_id }) => ({
          project_id,
          category_id,
        }));
      }),
    )
    .execute();
}

async function addOrgs(db: Kysely<DB>) {
  const orgs_to_gen = 100;

  const users = await db.selectFrom("ms_users").select("id").execute();
  const cats = await db.selectFrom("ms_category_orgs").select("id").execute();

  const names = faker.helpers.uniqueArray(faker.company.name, orgs_to_gen);

  const org_ids = await db
    .insertInto("ms_orgs")
    .values(
      looper(orgs_to_gen, (i) => ({
        address: faker.location.streetAddress(),
        description: faker.lorem.paragraphs(10),
        name: names[i],
        phone: faker.phone.number(),
        image: faker.image.avatar(),
      })),
    )
    .returning("id")
    .execute();

  await db
    .insertInto("orgs_users")
    .values(
      org_ids.flatMap(({ id }) => {
        const members = faker.helpers.arrayElements(
          users.map((x) => x.id),
          { min: 1, max: 10 },
        );
        return members.map((user_id) => ({
          org_id: id,
          role: faker.helpers.arrayElement(["Admin", "Invited"]),
          user_id,
        }));
      }),
    )
    .execute();

  await db
    .insertInto("categories_orgs")
    .values(
      org_ids.flatMap(({ id: org_id }) => {
        const cat = faker.helpers.arrayElements(cats);
        return cat.map(({ id: category_id }) => ({
          org_id,
          category_id,
        }));
      }),
    )
    .execute();
}

async function addUsers(db: Kysely<DB>) {
  const users_to_gen = 300;
  const pw = hashSync("halo");

  const names = faker.helpers.uniqueArray(faker.internet.username, users_to_gen);

  await db
    .insertInto("ms_users")
    .values(
      looper(users_to_gen, (i) => ({
        email: faker.internet.email(),
        name: names[i],
        password: pw,
        location: faker.location.city(),
        about_me: faker.person.bio(),
        image: faker.image.avatar(),
        workplace: faker.company.name(),
        website: faker.internet.url(),
        school: faker.company.name(),
        education_level: "Graduate",
      })),
    )
    .returning("id")
    .execute();
}

async function seedData(db: Kysely<DB>) {
  await addUsers(db);
  await addOrgs(db);
  await addProjects(db);
  await addContribs(db);
  await addChatrooms(db);
  await addBans(db);
  await addReports(db);
  await addFriends(db);
  await addTasks(db);
}

export default seedData;
