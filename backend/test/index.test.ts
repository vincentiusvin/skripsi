import { expect } from "chai";
import { describe } from "mocha";
import { Application } from "../src/app.js";
import { APIContext } from "./helpers.js";
import { clearDB, setupApp } from "./setup-test.js";

describe("/api/users", () => {
  let app: Application;
  before(async () => {
    app = await setupApp();
  });

  beforeEach(async () => {
    await clearDB(app);
  });

  after(async () => {
    await app.close();
  });

  it("should accept get", async () => {
    const res = await new APIContext("UsersGet").fetch("/api/users", {
      method: "GET",
    });
    expect(res.status).eq(200);
  });

  it("should accept post", async () => {
    const send_res = await new APIContext("UsersPost").fetch("/api/users", {
      method: "POST",
      body: {
        user_name: "testing",
        user_password: "testing",
      },
    });
    expect(send_res.status).eq(201);

    const test_res = await new APIContext("UsersGet").fetch("/api/users", {
      method: "GET",
    });
    expect(test_res.status).eq(200);

    const test_result = await test_res.json();
    const found = test_result.filter((x) => x.user_name === "testing");
    expect(found.length).to.equal(1);
  });
});
