import { Application } from "./app.js";
import { ExtractRH, UnionToIntersection } from "./helpers/types";
import { ChatController } from "./routes/chatroom.js";
import { Route } from "./routes/controller.js";
import { OrgController } from "./routes/orgs.js";
import { ProjectController } from "./routes/projects.js";
import { SessionController } from "./routes/session.js";
import { UserController } from "./routes/user.js";

export function registerControllers(app: Application) {
  const controllers = [
    new ChatController(app),
    new OrgController(app),
    new ProjectController(app),
    new SessionController(app),
    new UserController(app),
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
 * API[nama_key_sesuai_diatas]["ResBody" | "ReqBody" | "ReqParams"]
 */
export type API = {
  [K in keyof _api]: ExtractRH<_api[K]>;
};
