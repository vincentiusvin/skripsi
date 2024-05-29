import { db } from "../db/db";
import { AuthError, NotFoundError } from "./error";
import { RH } from "./types";

export const validateLogged: RH<{
  ResBody: { msg: string };
}> = function (req, res, next) {
  if (req.session.user_id) {
    next();
  } else {
    throw new AuthError("You need to be logged in!");
  }
};

export const validateProjectID: RH<{
  Params: {
    project_id: string;
  };
}> = async function (req, res, next) {
  const project_id = Number(req.params.project_id);

  const project = await db
    .selectFrom("ms_projects")
    .select("ms_projects.id")
    .where("id", "=", project_id)
    .executeTakeFirst();

  if (!project || project.id !== project_id) {
    throw new NotFoundError("Projek tidak dapat ditemukan!");
  } else {
    next();
  }
};
