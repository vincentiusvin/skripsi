import { expect } from "chai";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("bucket controller", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to update task", async () => {
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
        bucket_id: caseData.bucket_empty.id,
      },
    });
    expect(res.status).eq(200);

    const res2 = await new APIContext("BucketsDetailTasksGet").fetch(
      `/api/buckets/${caseData.bucket_empty.id}/tasks`,
      {
        headers: {
          cookie: cookie,
        },
        method: "get",
      },
    );
    const new_result = await res2.json();
    const task = new_result.find((x) => x.id === caseData.task.id);
    expect(task).to.not.eq(undefined);
  });

  it("should be able to write and read", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const res = await new APIContext("BucketsDetailTasksPost").fetch(
      `/api/buckets/${caseData.bucket_fill.id}/tasks`,
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
      `/api/buckets/${caseData.bucket_fill.id}/tasks`,
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
