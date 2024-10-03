import type { Express } from "express";
import { RequestHandler } from "express";
import { APISchema, RequestHandlerFromSchema } from "./types.js";

type Opts<S extends APISchema> = {
  handler: RequestHandlerFromSchema<S>;
  method: "get" | "put" | "post" | "patch" | "delete";
  path: string;
  schema?: S;
  priors?: RequestHandler[];
};

/**
 * Class penampung buat informasi route yang bakal diregister.
 *
 * Selain nampung juga ngelakuin type-checking.
 * Dia bakal mastiin fungsi `handler` nyambung sama `schema`.
 */
export class Route<S extends APISchema = APISchema> {
  opts: Opts<S>;

  constructor(opts: Opts<S>) {
    this.opts = opts;
  }

  register(express_server: Express) {
    const priors: RequestHandler[] = [];
    const { priors: in_priors, handler, method, path, schema } = this.opts;

    if (in_priors) {
      priors.push(...in_priors);
    }

    if (schema) {
      const { Params: paramSchema, ReqBody: bodySchema, ReqQuery: querySchema } = schema;
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
      express_server[method](path, ...priors, handler);
    } else {
      express_server[method](path, handler);
    }
  }
}

export abstract class Controller {
  private express_server: Express;
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

  constructor(express_server: Express) {
    this.express_server = express_server;
  }

  /**
   * Pasang routenya ke server express.
   * Dipasangnya di method yang terpisah karena method-method di derived class
   * belum dibuat pas constructor jalan.
   * See: https://www.typescriptlang.org/docs/handbook/2/classes.html#initialization-order
   */
  register() {
    const routes = Object.values(this.init());
    for (const route of routes) {
      route.register(this.express_server);
    }
  }
}
