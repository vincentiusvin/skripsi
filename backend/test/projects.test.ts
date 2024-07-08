import { expect } from "chai";
import { describe } from "mocha";
import { Application } from "../src/app.js";
import { APIContext, baseCase, getLoginCookie } from "./helpers.js";
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

  it("should promote org member as admin", async () => {
    const caseData = await baseCase(app);
    const cookie = await getLoginCookie(caseData.member.name, caseData.member.password);

    const res = await new APIContext("ProjectsDetailMembersPut").fetch(
      `/api/projects/${caseData.project.id}/users/${caseData.member.id}`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "PUT",
        body: {
          role: "Pending",
        },
      },
    );
    expect(res.status).eq(200);
    const result = await res.json();
    expect(result.role).eq("Admin");
  });

  it("should allow non org member to apply", async () => {
    const caseData = await baseCase(app);
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const res = await new APIContext("ProjectsDetailMembersPut").fetch(
      `/api/projects/${caseData.project.id}/users/${caseData.nonmember.id}`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "PUT",
        body: {
          role: "Pending",
        },
      },
    );
    expect(res.status).eq(200);
    const result = await res.json();
    expect(result.role).eq("Pending");
  });

  it("should allow admin to approve members", async () => {
    const caseData = await baseCase(app);

    const nonmember_cookie = await getLoginCookie(
      caseData.nonmember.name,
      caseData.nonmember.password,
    );

    const apply_nonmember = await new APIContext("ProjectsDetailMembersPut").fetch(
      `/api/projects/${caseData.project.id}/users/${caseData.nonmember.id}`,
      {
        headers: {
          cookie: nonmember_cookie,
        },
        credentials: "include",
        method: "PUT",
        body: {
          role: "Pending",
        },
      },
    );
    await apply_nonmember.json();

    const member_cookie = await getLoginCookie(caseData.member.name, caseData.member.password);

    const promote_member = await new APIContext("ProjectsDetailMembersPut").fetch(
      `/api/projects/${caseData.project.id}/users/${caseData.member.id}`,
      {
        headers: {
          cookie: member_cookie,
        },
        credentials: "include",
        method: "PUT",
        body: {
          role: "Pending",
        },
      },
    );
    await promote_member.json();

    const accept_nonmember = await new APIContext("ProjectsDetailMembersPut").fetch(
      `/api/projects/${caseData.project.id}/users/${caseData.nonmember.id}`,
      {
        headers: {
          cookie: member_cookie,
        },
        credentials: "include",
        method: "PUT",
        body: {
          role: "Dev",
        },
      },
    );
    expect(accept_nonmember.status).eq(200);
    const result = await accept_nonmember.json();
    expect(result.role).eq("Dev");
  });

  it("should be able to add and get buckets", async () => {
    const caseData = await baseCase(app);
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const res = await new APIContext("ProjectsDetailBucketsPost").fetch(
      `/api/projects/${caseData.project.id}/buckets`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "post",
        body: {
          name: "Hello",
        },
      },
    );
    expect(res.status).eq(201);
    await res.json();

    const res2 = await new APIContext("ProjectsDetailBucketsGet").fetch(
      `/api/projects/${caseData.project.id}/buckets`,
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
