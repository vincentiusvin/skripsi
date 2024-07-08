import { expect } from "chai";
import { Application } from "../src/app.js";
import { APIContext, baseCase, getLoginCookie } from "./helpers.js";
import { clearDB, setupApp } from "./setup-test.js";

describe("bucket controller", () => {
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

  it("should be able to update task", async () => {
    const caseData = await baseCase(app);
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const res = await new APIContext("TasksDetailPut").fetch(`/api/tasks/${caseData.task.id}`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "put",
      body: {
        name: "Not cool Task",
        description: "Cool",
      },
    });
    expect(res.status).eq(200);
    await res.json();
  });

  it("should be able to write and read", async () => {
    const caseData = await baseCase(app);
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const res = await new APIContext("BucketsDetailTasksPost").fetch(
      `/api/buckets/${caseData.bucket.id}/tasks`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "post",
        body: {
          name: "New Task",
          description: "Cool",
        },
      },
    );
    expect(res.status).eq(201);
    await res.json();

    const res2 = await new APIContext("BucketsDetailTasksGet").fetch(
      `/api/buckets/${caseData.bucket.id}/tasks`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "get",
      },
    );
    expect(res2.status).eq(200);
    const result = await res2.json();
    expect(result.length).eq(2);
  });
});
