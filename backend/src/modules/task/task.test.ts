import { expect } from "chai";
import { Application } from "../../app.js";
import { NotificationTester } from "../../test/NotificationTester.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("task api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("should be able to add and get buckets", async () => {
    const in_project = caseData.project;
    const in_user = caseData.dev_user;
    const in_name = "Hello";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addBucket(in_project.id, in_name, cookie);
    await send_req.json();
    const read_req = await getBuckets(in_project.id, cookie);
    const result = await read_req.json();

    const found = result.find((x) => x.name === in_name);

    expect(send_req.status).eq(201);
    expect(found).to.not.eq(undefined);
  });

  it("should be able to update task", async () => {
    const in_user = caseData.dev_user;
    const in_assignees = [caseData.project_admin_user, caseData.dev_user];
    const in_task = caseData.task[0];
    const in_name = "Not cool Task";
    const in_description = "Cool";
    const in_bucket = caseData.bucket_empty;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const asignees_id = in_assignees.map((x) => x.id);
    const send_req = await updateTask(
      in_task.id,
      {
        users: asignees_id,
        bucket_id: in_bucket.id,
        name: in_name,
        description: in_description,
      },
      cookie,
    );
    const read_req = await getTasks({ bucket_id: in_bucket.id }, cookie);
    const result = await read_req.json();
    const found = result.find((x) => x.id === in_task.id);

    expect(send_req.status).to.eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.description).to.eq(in_description);
    expect(found?.name).to.eq(in_name);
    expect(found?.users.map((x) => x.user_id).sort()).to.deep.eq(asignees_id.sort());
  });

  for (const [idx1, idx2] of [
    [0, 1],
    [1, 0],
  ]) {
    it("should be able to sort task", async () => {
      const in_user = caseData.dev_user;
      const in_before = caseData.task[idx1];
      const in_task = caseData.task[idx2];
      const in_bucket = caseData.bucket_fill;

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const send_req = await updateTask(
        in_task.id,
        {
          before_id: in_before.id,
        },
        cookie,
      );
      const read_req = await getTasks({ bucket_id: in_bucket.id }, cookie);
      const result = await read_req.json();
      const task_index = result.findIndex((x) => x.id === in_task.id);
      const before_index = result.findIndex((x) => x.id === in_before.id);

      expect(send_req.status).to.eq(200);
      expect(task_index).to.be.lessThan(before_index);
    });
  }

  for (const idx of [0, 1]) {
    it("should be able to move task to the end if no before_id is specified", async () => {
      const in_user = caseData.dev_user;
      const in_task = caseData.task[idx];
      const in_bucket = caseData.bucket_fill;

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const send_req = await updateTask(
        in_task.id,
        {
          bucket_id: in_bucket.id,
        },
        cookie,
      );
      const read_req = await getTasks({ bucket_id: in_bucket.id }, cookie);
      const result = await read_req.json();
      const task_index = result.findIndex((x) => x.id === in_task.id);

      expect(send_req.status).to.eq(200);
      expect(task_index).to.be.eq(result.length - 1);
    });
  }

  it("should be able to write and read", async () => {
    const in_user = caseData.dev_user;
    const in_bucket = caseData.bucket_fill;
    const in_name = "New Task";
    const in_description = "Cool";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addTask(
      {
        name: in_name,
        bucket_id: in_bucket.id,
        description: in_description,
      },
      cookie,
    );
    await send_req.json();
    const read_req = await getTasks({ bucket_id: in_bucket.id }, cookie);
    const result = await read_req.json();
    const found = result.find((x) => x.name === in_name);

    expect(send_req.status).eq(201);
    expect(read_req.status).eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.description).to.eq(in_description);
  });

  it("should be able to write and read to empty buckets", async () => {
    const in_user = caseData.dev_user;
    const in_bucket = caseData.bucket_empty;
    const in_name = "New Task";
    const in_description = "Cool";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addTask(
      {
        name: in_name,
        bucket_id: in_bucket.id,
        description: in_description,
        users: [in_user.id],
      },
      cookie,
    );
    await send_req.json();
    const read_req = await getTasks({ bucket_id: in_bucket.id }, cookie);
    const result = await read_req.json();
    const found = result.find((x) => x.name === in_name);

    expect(send_req.status).eq(201);
    expect(read_req.status).eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.description).to.eq(in_description);
  });

  it("should be able to delete task and get by detail", async () => {
    const in_user = caseData.dev_user;
    const in_task = caseData.task[0];

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await deleteTask(in_task.id, cookie);
    await send_req.json();
    const read_req = await getTaskDetail(in_task.id, cookie);
    await read_req.json();

    expect(send_req.status).eq(200);
    expect(read_req.status).eq(404);
  });

  it("should be able to update bucket and get by detail", async () => {
    const in_user = caseData.dev_user;
    const in_bucket = caseData.bucket_empty;
    const in_name = "nama baru bucket";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await updateBucket(
      in_bucket.id,
      {
        name: in_name,
      },
      cookie,
    );

    await send_req.json();
    const read_req = await getBucketDetail(in_bucket.id, cookie);
    const result = await read_req.json();

    expect(send_req.status).eq(200);
    expect(read_req.status).eq(200);
    expect(result.name).eq(in_name);
  });

  it("should be able to delete bucket and get by detail", async () => {
    const in_bucket = caseData.bucket_empty;
    const in_user = caseData.dev_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await deleteBucket(in_bucket.id, cookie);

    await send_req.json();
    const read_req = await getBucketDetail(in_bucket.id, cookie);
    await read_req.json();

    expect(send_req.status).eq(200);
    expect(read_req.status).eq(404);
  });

  describe("notifications", () => {
    it("should send a notification on new task", async () => {
      const in_user = caseData.dev_user;
      const in_bucket = caseData.bucket_fill;
      const in_name = "New Task";
      const in_description = "Cool";

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const nt = NotificationTester.fromCookie(in_user.id, cookie);
      await nt.start();
      const send_req = await addTask(
        {
          name: in_name,
          bucket_id: in_bucket.id,
          description: in_description,
          users: [in_user.id],
        },
        cookie,
      );
      await send_req.json();
      await nt.finish();
      const result = nt.diff();

      expect(result.length).to.eq(1);
    });
  });
});

function getTasks(opts: { bucket_id?: number }, cookie: string) {
  return new APIContext("TasksGet").fetch(`/api/tasks/`, {
    headers: {
      cookie: cookie,
    },
    query: { bucket_id: opts.bucket_id?.toString() },
    credentials: "include",
    method: "get",
  });
}

function addTask(
  data: {
    name: string;
    bucket_id: number;
    description?: string | undefined;
    end_at?: string | undefined;
    start_at?: string | undefined;
    users?: number[];
  },
  cookie: string,
) {
  return new APIContext("TasksPost").fetch(`/api/tasks`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: data,
  });
}

function deleteTask(task_id: number, cookie: string) {
  return new APIContext("TasksDetailDelete").fetch(`/api/tasks/${task_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "delete",
  });
}

function getTaskDetail(task_id: number, cookie: string) {
  return new APIContext("TasksDetailGet").fetch(`/api/tasks/${task_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
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
    users?: number[];
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

function addBucket(project_id: number, bucket_name: string, cookie: string) {
  return new APIContext("BucketsPost").fetch(`/api/buckets`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: {
      project_id,
      name: bucket_name,
    },
  });
}

function getBuckets(project_id: number, cookie: string) {
  return new APIContext("BucketsGet").fetch(`/api/buckets`, {
    headers: {
      cookie: cookie,
    },
    query: {
      project_id: project_id?.toString(),
    },
    credentials: "include",
    method: "get",
  });
}

function getBucketDetail(bucket_id: number, cookie: string) {
  return new APIContext("BucketsDetailGet").fetch(`/api/buckets/${bucket_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function updateBucket(bucket_id: number, data: { name?: string }, cookie: string) {
  return new APIContext("BucketsDetailPut").fetch(`/api/buckets/${bucket_id}`, {
    headers: {
      cookie: cookie,
    },
    body: data,
    credentials: "include",
    method: "put",
  });
}

function deleteBucket(bucket_id: number, cookie: string) {
  return new APIContext("BucketsDetailDelete").fetch(`/api/buckets/${bucket_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "delete",
  });
}
