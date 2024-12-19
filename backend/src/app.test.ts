import bytes from "bytes";
import { expect } from "chai";
import { randomBytes } from "crypto";
import { before, beforeEach, describe } from "mocha";
import { Application } from "./app.js";
import { FILE_LIMIT } from "./helpers/payloadmiddleware.js";
import { baseCase } from "./test/fixture_data.js";
import { APIContext } from "./test/helpers.js";
import { clearDB } from "./test/setup-test.js";

describe("server", () => {
  let app: Application;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app.db);
    await baseCase(app.db);
  });

  it("should handle requests that are too big gracefully", async () => {
    const in_bytes = bytes(FILE_LIMIT);
    expect(in_bytes).to.not.eq(null);
    const in_data = randomBytes(in_bytes!).toString("base64");

    const req = await new APIContext("SessionPut").fetch("/api/session", {
      body: {
        user_name: "testing",
        user_password: in_data,
      },
      method: "put",
    });
    const res = await req.json();
    expect(req.status).to.eq(413);
    expect("msg" in res);
  });
});
