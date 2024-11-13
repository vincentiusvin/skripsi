import { faker } from "@faker-js/faker";

import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

function looper<T>(times: number, func: (i: number) => T) {
  const ret: T[] = [];
  for (let i = 0; i < times; i++) {
    ret.push(func(i));
  }
  return ret;
}

async function addContribs(db: Kysely<DB>) {
  const users = await db.selectFrom("ms_users").select("id").execute();
  const projects = await db.selectFrom("ms_projects").select("id").execute();

  const contrib_id = await db
    .insertInto("ms_contributions")
    .values(
      looper(100, () => ({
        name: faker.hacker.adjective() + " " + faker.hacker.noun(),
        project_id: faker.helpers.arrayElement(projects).id,
        status: faker.helpers.arrayElement(["Approved", "Pending", "Revision", "Rejected"]),
        description: faker.hacker.phrase(),
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
            min: 0,
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
        content: faker.commerce.productDescription(),
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
        description: faker.company.buzzPhrase(),
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
    .execute();
}

async function seedData(db: Kysely<DB>) {
  await addUsers(db);
  await addOrgs(db);
  await addProjects(db);
  await addContribs(db);
}

export default seedData;
