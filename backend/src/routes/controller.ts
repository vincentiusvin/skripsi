import { RequestHandler } from "express";
import { Application } from "../app.js";
import { RHTop } from "../helpers/types.js";

export type RegisterOptions = {
  method: "get" | "put" | "post" | "patch" | "delete";
  path: string;
  handler: RHTop;
  priors?: RequestHandler[];
};

export abstract class Controller {
  private app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  abstract initialize(): RegisterOptions[];

  register(opts: RegisterOptions) {
    const { method, path, handler, priors } = opts;

    if (priors) {
      this.app.express_server[method](path, ...priors, handler);
    } else {
      this.app.express_server[method](path, handler);
    }
  }
}
