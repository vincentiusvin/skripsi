import { Application } from "./app.js";
import { ChatController } from "./controllers/chatroom.js";
import { Route } from "./controllers/controller.js";
import { OrgController } from "./controllers/orgs.js";
import { ProjectController } from "./controllers/projects.js";
import { SessionController } from "./controllers/session.js";
import { TaskController } from "./controllers/task.js";
import { UserController } from "./controllers/user.js";
import { ExtractRH, UnionToIntersection } from "./helpers/types";

export function registerControllers(app: Application) {
  const controllers = [
    new ChatController(app),
    new OrgController(app),
    new ProjectController(app),
    new SessionController(app),
    new UserController(app),
    new TaskController(app),
  ] as const;

  controllers.forEach((x) => x.register());

  return controllers;
}

type Controllers = ReturnType<typeof registerControllers>;
type Routes = UnionToIntersection<ReturnType<Controllers[number]["init"]>>;

type _api = {
  [K in keyof Routes]: Routes[K] extends Route<infer O> ? O : never;
};

/**
 * Export informasi type pada RequestHandler yang diregister diatas.
 * Cara pakainya dengan akses:
 * API[NamaKey]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
