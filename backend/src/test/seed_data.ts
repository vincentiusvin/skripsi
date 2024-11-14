import { faker } from "@faker-js/faker";

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

async function addBans(db: Kysely<DB>) {
  const users = await db.selectFrom("ms_users").select("id").execute();
  const bans_to_add = 50;
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
  const chats_to_gen = 200;
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
    .returning("id")
    .execute();

  const chat_users = await db
    .insertInto("chatrooms_users")
    .values(
      chat_ids.flatMap(({ id }) => {
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

  const messages_to_gen = 10000;
  const message_ids = await db
    .insertInto("ms_messages")
    .values(
      looper(messages_to_gen, () => {
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
        const has_file = faker.datatype.boolean(0.2);
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

async function addContribs(db: Kysely<DB>) {
  const contribs_to_add = 1000;
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
  const projects_to_gen = 100;

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
      })),
    )
    .returning("id")
    .execute();

  await db
    .insertInto("projects_users")
    .values(
      project_ids.flatMap(({ id }) => {
        const members = faker.helpers.arrayElements(users.map((x) => x.id));

        return members.map((user_id) => ({
          project_id: id,
          role: faker.helpers.arrayElement(["Admin", "Dev", "Invited"]),
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

  const org_ids = await db
    .insertInto("ms_orgs")
    .values(
      looper(orgs_to_gen, () => ({
        address: faker.location.streetAddress(),
        description: faker.lorem.paragraphs(10),
        name: faker.company.name(),
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
        const members = faker.helpers.arrayElements(users.map((x) => x.id));
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
  const users_to_gen = 200;
  await db
    .insertInto("ms_users")
    .values(
      looper(users_to_gen, () => ({
        email: faker.internet.email(),
        name: faker.internet.username(),
        password: faker.internet.password(),
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
}

export default seedData;
