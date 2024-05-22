import { db } from "../db/db";
import { ClientError } from "../helpers/error";
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
  ResBody: {
    project_id: number;
    project_name: string;
    org_id: number;
    project_desc: string;
  };
  Params: {
    id: number;
  };
}> = async function (req, res) {
  const id = req.params.id;
  const projects = await db
    .selectFrom("ms_projects")
    .select(["id as project_id", "name as project_name", "org_id", "description as project_desc"])
    .where("id", "=", id)
    .executeTakeFirst();

  res.status(200).json(projects);
};

export const addProjects: RH<{
  ReqBody: {
    project_name: string;
    org_id: number;
    project_desc: string;
  };
  ResBody: {
    msg: string;
  };
}> = async function (req, res) {
  const { project_name, org_id, project_desc } = req.body;
  //validasi
  if (project_name.length === 0) {
    throw new ClientError("Nama tidak boleh kosong");
  }
  if (project_desc.length == 0) {
    throw new ClientError("Deskripsi tidak boleh kosong");
  }
  await db
    .insertInto("ms_projects")
    .values({
      description: project_desc,
      name: project_name,
      org_id,
    })
    .execute();
  res.status(200).json({
    msg: "insert successfull",
  });
};
