import { expect } from "chai";
import { describe } from "mocha";
import { Application } from "../src/app.js";
import { APIContext, baseCase, login } from "./helpers.js";
import { clearDB, setupApp } from "./setup-test.js";

describe("/api/projects", () => {
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
    await baseCase(app);
    const res = await new APIContext("ProjectsGet").fetch(`/api/projects`, {
      method: "GET",
    });
    expect(res.status).eq(200);
    const result = await res.json();
    expect(result.length).to.be.gte(1);
  });

  it("should accept member checking", async () => {
    const ids = await baseCase(app);
    const res = await new APIContext("ProjectsDetailMembersGet").fetch(
      `/api/projects/${ids.project.id}/users/${ids.member.id}`,
      {
        method: "GET",
      },
    );
    expect(res.status).eq(404);
  });

  it("should accept registering new members", async () => {
    const data = await login(app, "member");

    const res = await new APIContext("ProjectsDetailMembersPut").fetch(
      `/api/projects/${data.project.id}/users/${data.member.id}`,
      {
        headers: {
          cookie: data.cookie,
        },
        credentials: "include",
        method: "PUT",
        body: {
          role: "Admin",
        },
      },
    );
    expect(res.status).eq(200);
  });
});
