import { RequestHandler } from "express";
import { ZodType } from "zod";
import { Application } from "../app.js";
import { RH, RHTop } from "../helpers/types.js";

/**
 * Class penampung buat informasi route yang bakal diregister.
 *
 * Selain nampung juga ngelakuin type-checking.
 * Dia bakal mastiin fungsi `handler` nyambung sama `schema`.
 */
export class Route<T extends RHTop = RHTop> {
  handler: T;
  method: "get" | "put" | "post" | "patch" | "delete";
  path: string;
  schema?: {
    ReqBody?: ZodType<T extends RH<infer O> ? O["ReqBody"] : never>;
    ReqQuery?: ZodType<T extends RH<infer O> ? O["ReqQuery"] : never>;
    Params?: ZodType<T extends RH<infer O> ? O["Params"] : never>;
  };
  priors?: RequestHandler[];

  constructor(opts: {
    handler: T;
    method: "get" | "put" | "post" | "patch" | "delete";
    path: string;
    schema?: {
      ReqBody?: ZodType<T extends RH<infer O> ? O["ReqBody"] : never>;
      ReqQuery?: ZodType<T extends RH<infer O> ? O["ReqQuery"] : never>;
      Params?: ZodType<T extends RH<infer O> ? O["Params"] : never>;
    };
    priors?: RequestHandler[];
  }) {
    const { handler, method, path, schema, priors } = opts;
    this.handler = handler;
    this.method = method;
    this.path = path;
    this.schema = schema;
    this.priors = priors;
  }

  register(app: Application) {
    const priors: RequestHandler[] = [];

    if (this.priors) {
      priors.push(...this.priors);
    }

    if (this.schema) {
      const { Params: paramSchema, ReqBody: bodySchema, ReqQuery: querySchema } = this.schema;
      const validator: RequestHandler = (req, res, next) => {
        if (paramSchema) {
          paramSchema.parse(req.params);
        }
        if (bodySchema) {
          bodySchema.parse(req.body);
        }
        if (querySchema) {
          querySchema.parse(req.query);
        }
        next();
      };
      priors.push(validator);
    }

    if (priors.length) {
      app.express_server[this.method](this.path, ...priors, this.handler);
    } else {
      app.express_server[this.method](this.path, this.handler);
    }
  }
}

export abstract class Controller {
  private app: Application;

  /**
   * Factory method untuk register route.
   * Kalau mau pasang route baru, bisa tambain objek {@link Route} ke return type fungsi ini. Formatnya:
   * ```ts
   *   return {
   *     NamaKey: new Route({
   *       handler: this.fn,
   *       method: "get",
   *       path: "/api/fn",
   *     }),
   *   };
   * ```
   * Key sebenarnya gak ngaruh ke logika program, cuma buat type inference aja.
   *
   * Penamaan keynya ikutin format ResourceMethod.
   */
  abstract init(): Record<string, Route>;

  constructor(app: Application) {
    this.app = app;
  }

  register() {
    const routes = Object.values(this.init());

    for (const route of routes) {
      route.register(this.app);
    }
  }
}
