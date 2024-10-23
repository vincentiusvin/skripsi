import { expect } from "chai";
import { sql } from "kysely";
import { db } from "../../db/db.js";
import { Transactable, TransactionManager } from "./transaction.js";

class TransactionTest implements Transactable<TransactionTest> {
  tm: TransactionManager;
  constructor(tm: TransactionManager) {
    this.tm = tm;
  }
  factory(tm: TransactionManager) {
    return new TransactionTest(tm);
  }
  async query() {
    return await this.tm.transaction(this as TransactionTest, async (x) => {
      return await sql`SELECT 'hello world' as txt`.execute(x.tm.getDB());
    });
  }

  async query2() {
    return await this.tm.transaction(this as TransactionTest, async (x) => {
      return await x.query();
    });
  }
}

describe("transaction manager", () => {
  it("should be able to handle nested transactions", async () => {
    const tm = new TransactionManager(db);
    const tinst = new TransactionTest(tm);
    const dat = await tinst.query2();
    const res = dat.rows[0];

    expect(res).to.deep.equal({
      txt: "hello world",
    });
  });
});
