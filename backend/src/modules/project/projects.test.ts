import { expect } from "chai";
import { describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { ProjectRoles } from "./ProjectMisc.js";

describe("/api/projects", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to get projects", async () => {
    const read_req = await getProjects();
    const result = await read_req.json();
    const found = result.find((x) => x.org_id === caseData.org.id);

    expect(read_req.status).eq(200);
    expect(found).to.not.eq(undefined);
  });

  it("should promote org member as admin", async () => {
    const in_user = caseData.member;
    const in_project = caseData.project;
    const in_role = "Pending";

    const expected_role = "Admin";

    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const res = await assignMember(in_project.id, in_user.id, in_role, cookie);
    const result = await res.json();

    expect(res.status).eq(200);
    expect(result.role).eq(expected_role);
  });

  it("should allow non org member to apply", async () => {
    const in_user = caseData.nonmember;
    const in_project = caseData.project;
    const in_role = "Pending";

    const expected_role = "Pending";

    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const res = await assignMember(in_project.id, in_user.id, in_role, cookie);
    const result = await res.json();

    expect(res.status).eq(200);
    expect(result.role).eq(expected_role);
  });

  it("should allow admin to approve members", async () => {
    const in_dev = caseData.nonmember;
    const in_admin = caseData.member;
    const in_project = caseData.project;

    // dev applies
    const dev_cookie = await getLoginCookie(in_dev.name, in_dev.password);
    const send_dev_req = await assignMember(in_project.id, in_dev.id, "Pending", dev_cookie);
    const apply_result = await send_dev_req.json();

    // promote admin
    const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
    await assignMember(in_project.id, in_admin.id, "Pending", admin_cookie);

    // admin accepts
    const accept_dev_req = await assignMember(in_project.id, in_dev.id, "Dev", admin_cookie);
    const accept_result = await accept_dev_req.json();

    expect(send_dev_req.status).eq(200);
    expect(accept_dev_req.status).eq(200);
    expect(apply_result.role).eq("Pending");
    expect(accept_result.role).eq("Dev");
  });

  it("should be able to add and get buckets", async () => {
    const in_project = caseData.project;
    const in_user = caseData.nonmember;
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

  it("should be able to unassign user roles", async () => {
    const in_user = caseData.dev_user;
    const in_project = caseData.project;
    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const expected_role = "Not Involved";

    const read_req = await unassignMember(in_project.id, in_user.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).to.eq(200);
    expect(result.role).to.eq(expected_role);
  });

  it("should be able to read user role", async () => {
    const in_user = caseData.dev_user;
    const in_project = caseData.project;
    const expected_role = "Dev";

    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const read_req = await getMemberRole(in_project.id, in_user.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).to.eq(200);
    expect(result.role).to.eq(expected_role);
  });

  it("should be able to add projects and view detail", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const in_name = "proj_name";
    const in_org = caseData.org;
    const in_desc = "Testing data desc";

    const send_req = await addProject(
      {
        org_id: in_org.id,
        project_desc: in_desc,
        project_name: in_name,
      },
      cookie,
    );
    const send_result = await send_req.json();
    const read_req = await getProjectDetail(send_result.project_id, cookie);
    const read_result = await read_req.json();

    expect(send_req.status).eq(201);
    expect(read_req.status).eq(200);
    expect(read_result.project_name).to.eq(in_name);
    expect(read_result.org_id).to.eq(in_org.id);
    expect(read_result.project_desc).to.eq(in_desc);
  });

  it.skip("should be able to delete projects", async () => {
    const in_proj = caseData.project;
    const in_user = caseData.member;
    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const send_req = await deleteProject(in_proj.id, cookie);

    expect(send_req.status).to.eq(200);
  });
});

// TODO
function deleteProject(project_id: number, cookie: string) {
  return new APIContext("ProjectsGet").fetch(`/api/projects`, {
    method: "delete",
    headers: {
      cookie: cookie,
    },
    credentials: "include",
  });
}

function getProjects() {
  return new APIContext("ProjectsGet").fetch(`/api/projects`, {
    method: "GET",
  });
}

function assignMember(project_id: number, user_id: number, role: ProjectRoles, cookie: string) {
  return new APIContext("ProjectsDetailMembersPut").fetch(
    `/api/projects/${project_id}/users/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "PUT",
      body: {
        role,
      },
    },
  );
}

function addBucket(project_id: number, bucket_name: string, cookie: string) {
  return new APIContext("ProjectsDetailBucketsPost").fetch(`/api/projects/${project_id}/buckets`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: {
      name: bucket_name,
    },
  });
}

function getBuckets(project_id: number, cookie: string) {
  return new APIContext("ProjectsDetailBucketsGet").fetch(`/api/projects/${project_id}/buckets`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function addProject(
  data: {
    project_name: string;
    org_id: number;
    project_desc: string;
    category_id?: number[] | undefined;
  },
  cookie: string,
) {
  return new APIContext("ProjectsPost").fetch(`/api/projects`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: data,
  });
}

function getProjectDetail(project_id: number, cookie: string) {
  return new APIContext("ProjectsDetailGet").fetch(`/api/projects/${project_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function getMemberRole(project_id: number, user_id: number, cookie: string) {
  return new APIContext("ProjectsDetailMembersGet").fetch(
    `/api/projects/${project_id}/users/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    },
  );
}

function unassignMember(project_id: number, user_id: number, cookie: string) {
  return new APIContext("ProjectsDetailMembersGet").fetch(
    `/api/projects/${project_id}/users/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "delete",
    },
  );
}
