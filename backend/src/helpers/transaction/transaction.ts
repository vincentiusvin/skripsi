import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";

export class TransactionManager {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  getDB() {
    return this.db;
  }

  async transaction<T extends Transactable<T>, R>(obj: T, cb: (x: T) => Promise<R>) {
    if (this.db.isTransaction) {
      return await cb(obj); // serv === this
    }

    return await this.db.transaction().execute(async (trx) => {
      const tm = new TransactionManager(trx);
      const service = obj.factory(tm);
      return await cb(service); // serv === new object
    });
  }
}

export interface Transactable<T> {
  factory: (tm: TransactionManager) => T;
}
