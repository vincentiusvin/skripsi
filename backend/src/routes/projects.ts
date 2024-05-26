import { ExpressionBuilder } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { db } from "../db/db";
import { DB } from "../db/db_types";
import { ClientError, NotFoundError } from "../helpers/error";
import { RH } from "../helpers/types";

function withDevs(eb: ExpressionBuilder<DB, "ms_projects">) {
  return jsonArrayFrom(
    eb
      .selectFrom("projects_users")
      .innerJoin("ms_users", "ms_users.id", "projects_users.user_id")
      .select(["ms_users.id", "ms_users.name"])
      .whereRef("projects_users.project_id", "=", "ms_projects.id"),
  );
}

function withOrgMembers(eb: ExpressionBuilder<DB, "ms_projects">) {
  return jsonArrayFrom(
    eb
      .selectFrom("ms_orgs")
      .innerJoin("orgs_users", "orgs_users.org_id", "ms_orgs.id")
      .innerJoin("ms_users", "ms_users.id", "orgs_users.user_id")
      .select(["ms_users.id", "ms_users.name"])
      .whereRef("ms_orgs.id", "=", "ms_projects.org_id"),
  );
}

export async function getProjectMembers(project_id: number) {
  const project = await db
    .selectFrom("ms_projects")
    .select((eb) => [withDevs(eb).as("project_devs"), withOrgMembers(eb).as("org_members")])
    .where("ms_projects.id", "=", project_id)
    .executeTakeFirst();

  if (project === undefined) {
    throw new NotFoundError("Projek tidak dapat ditemukan!");
  }

  return {
    project_devs: project.project_devs.map((x) => x.id),
    org_members: project.org_members.map((x) => x.id),
  };
}

export const getProjectsDetailMembersDetail: RH<{
  ResBody: {
    status: "Member" | "Dev" | "Not Involved";
  };
  Params: {
    project_id: string;
    user_id: string;
  };
}> = async function (req, res) {
  const { project_id: project_id_str, user_id: user_id_str } = req.params;
  const project_id = Number(project_id_str);
  const user_id = Number(user_id_str);

  const result = await getProjectMembers(project_id);

  if (result.org_members.includes(user_id)) {
    res.json({ status: "Member" });
  } else if (result.project_devs.includes(user_id)) {
    res.json({ status: "Dev" });
  } else {
    res.json({ status: "Not Involved" });
  }
};

export const putProjectsDetailMembersDetail: RH<{
  ResBody: {
    msg: string;
  };
  Params: {
    project_id: string;
    user_id: string;
  };
}> = async function (req, res) {
  const { project_id: project_id_str, user_id: user_id_str } = req.params;
  const project_id = Number(project_id_str);
  const user_id = Number(user_id_str);

  const involved = await db
    .selectFrom("ms_projects")
    .select((eb) => [withDevs(eb).as("project_devs"), withOrgMembers(eb).as("org_members")])
    .where("ms_projects.id", "=", project_id)
    .executeTakeFirst();

  if (!involved) {
    throw new NotFoundError("Projek tidak dapat ditemukan!");
  }

  const org_members = involved.org_members.map((x) => x.id);
  const project_devs = involved.project_devs.map((x) => x.id);

  if (org_members.includes(user_id)) {
    throw new ClientError("Pengguna sudah terlibat melalui organisasi!");
  }

  if (project_devs.includes(user_id)) {
    throw new ClientError("Pengguna sudah terlibat dalam projek!");
  }

  await db
    .insertInto("projects_users")
    .values({
      project_id: project_id,
      user_id: user_id,
    })
    .execute();

  res.json({ msg: "Pengguna berhasil ditambahkan!" });
};

export const deleteProjectsDetailMembersDetail: RH<{
  ResBody: {
    msg: string;
  };
  Params: {
    project_id: string;
    user_id: string;
  };
}> = async function (req, res) {
  const { project_id: project_id_str, user_id: user_id_str } = req.params;
  const project_id = Number(project_id_str);
  const user_id = Number(user_id_str);

  const involved = await db
    .selectFrom("ms_projects")
    .select((eb) => [withDevs(eb).as("project_devs"), withOrgMembers(eb).as("org_members")])
    .where("ms_projects.id", "=", project_id)
    .executeTakeFirst();

  if (!involved) {
    throw new NotFoundError("Projek tidak dapat ditemukan!");
  }

  const org_members = involved.org_members.map((x) => x.id);
  const project_devs = involved.project_devs.map((x) => x.id);

  if (org_members.includes(user_id)) {
    throw new ClientError("Pengguna terlibat melalui organisasi dan tidak dapat dihapus!");
  }

  if (!project_devs.includes(user_id)) {
    throw new ClientError("Pengguna tidak terlibat dalam projek!");
  }

  await db.deleteFrom("projects_users").where((eb) =>
    eb.and({
      "projects_users.project_id": project_id,
      "projects_users.user_id": user_id,
    }),
  );

  res.status(200).json({ msg: "Pengguna berhasil dihapus dari projek!" });
};

export const getProjects: RH<{
  ResBody: {
    project_id: number;
    project_name: string;
    org_id: number;
  }[];
  ReqQuery: {
    org_id: string;
  };
}> = async function (req, res) {
  const id = req.query.org_id;
  let projects = db
    .selectFrom("ms_projects")
    .select(["id as project_id", "name as project_name", "org_id"]);
  if (id != undefined) {
    projects = projects.where("org_id", "=", Number(id));
  }
  const result = await projects.execute();

  res.status(200).json(result);
};

export const getProjectsDetail: RH<{
  ReqParams: { id: number };
  ResBody: {
    project_id: number;
    project_name: string;
    org_id: number;
    project_desc: string;
    project_devs: {
      id: number;
      name: string;
    }[];
    project_categories: string[];
  };
  Params: {
    project_id: number;
  };
}> = async function (req, res) {
  const id = req.params.project_id;
  const project = await db
    .selectFrom("ms_projects")
    .select((eb) => [
      "ms_projects.id as project_id",
      "ms_projects.name as project_name",
      "ms_projects.org_id",
      "ms_projects.description as project_desc",
      jsonArrayFrom(
        eb
          .selectFrom("ms_users")
          .innerJoin("projects_users", "ms_users.id", "projects_users.user_id")
          .select(["ms_users.id", "ms_users.name"])
          .whereRef("projects_users.project_id", "=", "ms_projects.id"),
      ).as("project_devs"),
      jsonArrayFrom(
        eb
          .selectFrom("categories_projects")
          .innerJoin(
            "ms_category_projects",
            "categories_projects.category_id",
            "ms_category_projects.id",
          )
          .select(["ms_category_projects.name as category_name"])
          .whereRef("categories_projects.project_id", "=", "ms_projects.id"),
      ).as("project_categories"),
    ])
    .where("ms_projects.id", "=", id)
    .executeTakeFirst();

  if (!project) {
    throw new NotFoundError("Project yang dicari tidak dapat ditemukan!");
  }

  // Extract category names from the project object
  const projectCategories = project.project_categories.map(
    (category: { category_name: string }) => category.category_name,
  );

  // Return modified project object with project_categories
  const modifiedProject = {
    ...project,
    project_categories: projectCategories,
  };

  res.status(200).json(modifiedProject);
};

export const postProjects: RH<{
  ReqBody: {
    project_name: string;
    org_id: number;
    project_desc: string;
    category_id: number;
  };
  ResBody: {
    msg: string;
  };
}> = async function (req, res) {
  const { project_name, org_id, project_desc, category_id } = req.body;
  //validasi
  if (project_name.length === 0) {
    throw new ClientError("Nama tidak boleh kosong");
  }
  if (project_desc.length == 0) {
    throw new ClientError("Deskripsi tidak boleh kosong");
  }

  if (!category_id) throw new ClientError("Kategori tidak boleh kosong!");

  const prj = await db
    .insertInto("ms_projects")
    .values({
      description: project_desc,
      name: project_name,
      org_id,
    })
    .returning("id")
    .executeTakeFirst();

  if (!prj) {
    throw new Error("Failed to insert project");
  }
  // Insert project_id and category_id into ms_category_project table
  await db
    .insertInto("categories_projects")
    .values({
      project_id: prj.id,
      category_id: category_id,
    })
    .execute();

  res.status(200).json({
    msg: "insert successfull",
  });
};

export const getProjectsCategories: RH<{
  ResBody: {
    id: number;
    name: string;
  }[];
}> = async function (req, res) {
  const category = await db.selectFrom("ms_category_projects").select(["id", "name"]).execute();

  res.status(200).json(category);
};
