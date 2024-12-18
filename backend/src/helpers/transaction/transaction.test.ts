import { expect } from "chai";
import { sql } from "kysely";
import { db } from "../../db/db.js";
import { baseCase } from "../../test/fixture_data.js";
import { clearDB } from "../../test/setup-test.js";
import { Transactable, TransactionManager } from "./transaction.js";

class TransactionTest implements Transactable<TransactionTest> {
  tm: TransactionManager;
  name = "testing transaction";
  constructor(tm: TransactionManager) {
    this.tm = tm;
  }
  factory(tm: TransactionManager) {
    return new TransactionTest(tm);
  }
  async query() {
    return await sql`SELECT 'hello world' as txt`.execute(this.tm.getDB());
  }

  async insertTest() {
    const db = this.tm.getDB();
    await db
      .insertInto("category_orgs")
      .values({
        name: this.name,
      })
      .execute();
  }

  async findInserted() {
    const result = await this.tm
      .getDB()
      .selectFrom("category_orgs")
      .where("name", "=", this.name)
      .executeTakeFirst();
    return result != undefined;
  }
}

describe("transaction manager", () => {
  beforeEach(async () => {
    await clearDB(db);
    await baseCase(db);
  });

  it("should be able to handle nested transactions", async () => {
    const tm = new TransactionManager(db);
    const tinst = new TransactionTest(tm);
    const dat = await tinst.tm.transaction(tinst, async (tinst2) => {
      return await tinst2.tm.transaction(tinst2, async (tisnt3) => {
        return await tisnt3.query();
      });
    });
    const res = dat.rows[0];

    expect(res).to.deep.equal({
      txt: "hello world",
    });
  });

  it("should be able to insert using transactions", async () => {
    const tm = new TransactionManager(db);
    const tinst = new TransactionTest(tm);
    await tinst.tm.transaction(tinst, async (tinst2) => {
      await tinst2.insertTest();
    });
    const dat = await tinst.findInserted();
    expect(dat).to.eq(true);
  });

  it("should discard data when transaction failed", async () => {
    const tm = new TransactionManager(db);
    const tinst = new TransactionTest(tm);
    try {
      await tinst.tm.transaction(tinst, async (tinst2) => {
        await tinst2.insertTest();
        throw new Error("Deliberate error");
      });
    } catch (e) {
      e;
    }
    const dat = await tinst.findInserted();
    expect(dat).to.eq(false);
  });
});
