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
    const in_user = caseData.nonmember;
    const task_id = caseData.task.id;
    const in_name = "Not cool Task";
    const in_description = "Cool";
    const in_bucket = caseData.bucket_empty;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await updateTask(
      task_id,
      {
        bucket_id: in_bucket.id,
        name: in_name,
        description: in_description,
      },
      cookie,
    );
    const read_req = await getTasks(in_bucket.id, cookie);
    const result = await read_req.json();
    const found = result.find((x) => x.id === caseData.task.id);

    expect(send_req.status).to.eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.description).to.eq(in_description);
    expect(found?.name).to.eq(in_name);
  });

  it("should be able to write and read", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);
    const in_bucket = caseData.bucket_fill;
    const in_name = "New Task";
    const in_description = "Cool";

    const send_req = await addTask(
      in_bucket.id,
      {
        name: in_name,
        description: in_description,
      },
      cookie,
    );
    await send_req.json();
    const read_req = await getTasks(in_bucket.id, cookie);
    const result = await read_req.json();
    const found = result.find((x) => x.name === in_name);

    expect(send_req.status).eq(201);
    expect(read_req.status).eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.description).to.eq(in_description);
  });
});

function getTasks(bucket_id: number, cookie: string) {
  return new APIContext("BucketsDetailTasksGet").fetch(`/api/buckets/${bucket_id}/tasks`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function addTask(
  bucket_id: number,
  data: {
    name: string;
    description?: string | undefined;
    end_at?: Date | undefined;
    start_at?: Date | undefined;
  },
  cookie: string,
) {
  return new APIContext("BucketsDetailTasksPost").fetch(`/api/buckets/${bucket_id}/tasks`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: data,
  });
}

function updateTask(
  task_id: number,
  data: {
    bucket_id?: number;
    before_id?: number;
    name?: string;
    description?: string;
    start_at?: string;
    end_at?: string;
  },
  cookie: string,
) {
  return new APIContext("TasksDetailPut").fetch(`/api/tasks/${task_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "put",
    body: data,
  });
}
