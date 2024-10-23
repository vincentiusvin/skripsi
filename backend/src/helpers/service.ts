import { Kysely } from "kysely";
import { DB } from "../db/db_types.js";

export class TransactionManager {
  db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async transaction<T extends Transactable<T>, R>(obj: T, cb: (x: T) => Promise<R>) {
    if (this.db.isTransaction) {
      const service = obj.factory(this);
      return await cb(service);
    }

    return await this.db.transaction().execute(async (trx) => {
      const tm = new TransactionManager(trx);
      const service = obj.factory(tm);
      return await cb(service);
    });
  }
}

export interface Transactable<T> {
  factory: (tm: TransactionManager) => T;
}
