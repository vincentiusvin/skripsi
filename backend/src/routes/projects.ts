import { jsonArrayFrom } from "kysely/helpers/postgres";
import { db } from "../db/db";
import { ClientError, NotFoundError } from "../helpers/error";
import { RH } from "../helpers/types";

export const getProjects: RH<{
  ResBody: {
    project_id: number;
    project_name: string;
    org_id: number;
  }[];
}> = async function (req, res) {
  const projects = await db
    .selectFrom("ms_projects")
    .select(["id as project_id", "name as project_name", "org_id"])
    .execute();

  res.status(200).json(projects);
};

export const getProjectsDetail: RH<{
  ReqParams: { id: number };
  ResBody: {
    project_id: number;
    project_name: string;
    org_id: number;
    project_desc: string;
    project_categories: string[];
  };
}> = async function (req, res) {
  const id = req.params.id;

  const project = await db
    .selectFrom("ms_projects")
    .select((eb) => [
      "ms_projects.id as project_id",
      "ms_projects.name as project_name",
      "ms_projects.org_id",
      "ms_projects.description as project_desc",
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

export const addProjects: RH<{
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

export const getProjectCategory: RH<{
  ResBody: {
    id: number;
    name: string;
  }[];
}> = async function (req, res) {
  const category = await db.selectFrom("ms_category_projects").select(["id", "name"]).execute();

  res.status(200).json(category);
};
