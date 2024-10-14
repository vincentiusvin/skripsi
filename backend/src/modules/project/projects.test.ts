import { expect } from "chai";
import { describe } from "mocha";
import { Application } from "../../app.js";
import { NotificationTester } from "../../test/NotificationTester.js";
import { ProjectEventTester } from "../../test/ProjectEventTester.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { ProjectRoles } from "./ProjectMisc.js";

describe("projects api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("should be able to get projects", async () => {
    const read_req = await getProjects();
    const result = await read_req.json();
    const found = result.find((x) => x.org_id === caseData.org.id);

    expect(read_req.status).eq(200);
    expect(found).to.not.eq(undefined);
  });

  it("should promote org member as admin", async () => {
    const in_user = caseData.org_user;
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
    const in_user = caseData.plain_user;
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
    const in_dev = caseData.plain_user;
    const in_admin = caseData.project_admin_user;
    const in_project = caseData.project;

    // dev applies
    const dev_cookie = await getLoginCookie(in_dev.name, in_dev.password);
    const send_dev_req = await assignMember(in_project.id, in_dev.id, "Pending", dev_cookie);
    const apply_result = await send_dev_req.json();

    // admin accepts
    const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const accept_dev_req = await assignMember(in_project.id, in_dev.id, "Dev", admin_cookie);
    const accept_result = await accept_dev_req.json();

    expect(send_dev_req.status).eq(200);
    expect(accept_dev_req.status).eq(200);
    expect(apply_result.role).eq("Pending");
    expect(accept_result.role).eq("Dev");
  });

  it("should allow admin to invite members", async () => {
    const in_dev = caseData.plain_user;
    const in_admin = caseData.project_admin_user;
    const in_project = caseData.project;

    // promote admin
    const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const invite_req = await assignMember(in_project.id, in_dev.id, "Invited", admin_cookie);
    const invite_result = await invite_req.json();

    // dev accepts
    const dev_cookie = await getLoginCookie(in_dev.name, in_dev.password);
    const accept_dev_req = await assignMember(in_project.id, in_dev.id, "Dev", dev_cookie);
    const accept_result = await accept_dev_req.json();

    expect(invite_req.status).eq(200);
    expect(accept_dev_req.status).eq(200);
    expect(invite_result.role).eq("Invited");
    expect(accept_result.role).eq("Dev");
  });

  it("shouldn't allow admin to invite members that disabled being invited", async () => {
    const in_disabled_dev = caseData.pref_user;
    const in_admin = caseData.project_admin_user;
    const in_project = caseData.project;

    const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const invite_req = await assignMember(
      in_project.id,
      in_disabled_dev.id,
      "Invited",
      admin_cookie,
    );
    await invite_req.json();

    expect(invite_req.status).to.eq(400);
  });

  it("should not allow users to self promote", async () => {
    const in_dev = caseData.plain_user;
    const in_project = caseData.project;

    const dev_cookie = await getLoginCookie(in_dev.name, in_dev.password);
    const accept_dev_req = await assignMember(in_project.id, in_dev.id, "Dev", dev_cookie);

    expect(accept_dev_req.status).eq(401);
  });

  it("should not allow admin to promote people that didn't apply", async () => {
    const in_dev = caseData.plain_user;
    const in_admin = caseData.project_admin_user;
    const in_project = caseData.project;

    const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const invite_req = await assignMember(in_project.id, in_dev.id, "Dev", admin_cookie);

    expect(invite_req.status).eq(401);
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
    const in_user = caseData.org_user;
    const in_name = "proj_name";
    const in_org = caseData.org;
    const in_desc = "Testing data desc";
    const in_category = caseData.project_categories.slice(0, 1).map((x) => x.id);

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addProject(
      {
        org_id: in_org.id,
        project_desc: in_desc,
        project_name: in_name,
        category_id: in_category,
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
    expect(read_result.project_categories.map((x) => x.category_id)).to.deep.eq(in_category);
  });

  it("should be able to update projects", async () => {
    const in_user = caseData.project_admin_user;
    const in_proj = caseData.project;
    const in_name = "new project name after edit";
    const in_desc = "new project description";
    const in_category = caseData.project_categories.slice(0, 2).map((x) => x.id);

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await updateProject(
      in_proj.id,
      {
        project_desc: in_desc,
        project_name: in_name,
        category_id: in_category,
      },
      cookie,
    );
    const send_result = await send_req.json();
    const read_req = await getProjectDetail(send_result.project_id, cookie);
    const read_result = await read_req.json();

    expect(send_req.status).eq(200);
    expect(read_req.status).eq(200);
    expect(read_result.project_name).to.eq(in_name);
    expect(read_result.project_desc).to.eq(in_desc);
    expect(read_result.project_categories.map((x) => x.category_id)).to.deep.eq(in_category);
  });

  it("should be able to delete projects", async () => {
    const in_proj = caseData.project;
    const in_user = caseData.project_admin_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await deleteProject(in_proj.id, cookie);
    const read_req = await getProjects();
    const read_result = await read_req.json();
    const find_project = read_result.find((x) => x.project_id === in_proj.id);

    expect(send_req.status).to.eq(200);

    expect(read_req.status).eq(200);
    expect(find_project).eq(undefined);
  });

  describe("notifications", () => {
    it("should send notification on user acceptance", async () => {
      const in_dev = caseData.plain_user;
      const in_admin = caseData.project_admin_user;
      const in_project = caseData.project;

      // dev applies
      const dev_cookie = await getLoginCookie(in_dev.name, in_dev.password);
      const nt = NotificationTester.fromCookie(in_dev.id, dev_cookie);
      const send_dev_req = await assignMember(in_project.id, in_dev.id, "Pending", dev_cookie);
      await send_dev_req.json();

      // admin accepts
      await nt.start();
      const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
      const accept_dev_req = await assignMember(in_project.id, in_dev.id, "Dev", admin_cookie);
      await accept_dev_req.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).to.eq(1);
    });

    it("should send notification to org users when user applies", async () => {
      const in_user = caseData.plain_user;
      const in_project = caseData.project;
      const in_project_admin = caseData.project_admin_user;
      const in_role = "Pending";

      const nt = await NotificationTester.fromLoginInfo(
        in_project_admin.id,
        in_project_admin.name,
        in_project_admin.password,
      );
      await nt.start();
      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const res = await assignMember(in_project.id, in_user.id, in_role, cookie);
      await res.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).eq(1);
    });

    it("should send notification to invited users", async () => {
      const in_dev = caseData.plain_user;
      const in_admin = caseData.project_admin_user;
      const in_project = caseData.project;

      const nt = await NotificationTester.fromLoginInfo(in_dev.id, in_dev.name, in_dev.password);
      await nt.start();
      const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
      const invite_req = await assignMember(in_project.id, in_dev.id, "Invited", admin_cookie);
      await invite_req.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).eq(1);
    });
  });

  describe("events", () => {
    it("should send an event on new admin", async () => {
      const in_user = caseData.org_user;
      const in_project = caseData.project;
      const in_role = "Pending";
      const in_viewer = caseData.project_admin_user;

      const pet = await ProjectEventTester.fromLoginInfo(
        in_project.id,
        in_viewer.name,
        in_viewer.password,
      );
      await pet.start();
      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const res = await assignMember(in_project.id, in_user.id, in_role, cookie);
      await res.json();
      await pet.finish();
      const diff = pet.diff();

      expect(diff.length).to.eq(1);
    });

    it("should send an event on new dev", async () => {
      const in_dev = caseData.plain_user;
      const in_admin = caseData.project_admin_user;
      const in_project = caseData.project;

      // dev applies
      const dev_cookie = await getLoginCookie(in_dev.name, in_dev.password);
      const send_dev_req = await assignMember(in_project.id, in_dev.id, "Pending", dev_cookie);
      await send_dev_req.json();

      // admin accepts
      const admin_cookie = await getLoginCookie(in_admin.name, in_admin.password);
      const pet = ProjectEventTester.fromCookie(in_project.id, admin_cookie);
      await pet.start();
      const accept_dev_req = await assignMember(in_project.id, in_dev.id, "Dev", admin_cookie);
      await accept_dev_req.json();
      await pet.finish();
      const diff = pet.diff();

      expect(diff.length).to.eq(1);
    });
  });
});

function deleteProject(project_id: number, cookie: string) {
  return new APIContext("ProjectsGet").fetch(`/api/projects/${project_id}`, {
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

function updateProject(
  project_id: number,
  data: {
    project_name?: string;
    project_desc?: string;
    category_id?: number[] | undefined;
  },
  cookie: string,
) {
  return new APIContext("ProjectsDetailPut").fetch(`/api/projects/${project_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "put",
    body: data,
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
