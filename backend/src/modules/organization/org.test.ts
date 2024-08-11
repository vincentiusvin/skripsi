import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { OrgRoles } from "./OrgMisc.js";

describe("org controller", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to get org", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);
    const expected_org = caseData.org.id;

    const read_req = await getOrgs(cookie);
    const result = await read_req.json();
    const found_org = result.find((x) => x.org_id === expected_org);

    expect(read_req.status).eq(200);
    expect(found_org).to.not.eq(undefined);
    expect(found_org?.org_name).to.eq(caseData.org.name);
  });

  it("should be able to post org", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const in_name = "Test Case";
    const in_addr = "Tangerang";
    const in_phone = "123";
    const in_desc = "Hello";

    const send_req = await addOrg(
      {
        org_address: in_addr,
        org_description: in_desc,
        org_name: in_name,
        org_phone: in_phone,
      },
      cookie,
    );
    await send_req.json();

    const read_req = await getOrgs(cookie);
    const result = await read_req.json();
    const found_org = result.find((x) => x.org_name === in_name);

    expect(read_req.status).eq(200);
    expect(found_org).to.not.eq(undefined);
    expect(found_org?.org_description).to.eq(in_desc);
  });

  it("should be able to update and get detail", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);
    const in_org = caseData.org;

    const in_name = "new_name";
    const in_addr = "new_place";

    const send_req = await updateOrg(
      in_org.id,
      {
        org_name: in_name,
        org_address: in_addr,
      },
      cookie,
    );
    await send_req.json();

    const read_req = await getOrgDetail(in_org.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result.org_name).eq(in_name);
    expect(result.org_address).eq(in_addr);
  });

  it("should be able to delete", async () => {
    const in_org = caseData.org;
    const in_admin = caseData.member;

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await deleteOrg(in_org.id, cookie);
    const read_req = await getOrgs(cookie);
    const result = await read_req.json();
    const found_org = result.find((x) => x.org_id === caseData.org.id);

    expect(send_req.status).to.eq(200);
    expect(read_req.status).eq(200);
    expect(found_org).to.eq(undefined);
  });

  it("should be able to invite new org member", async () => {
    const in_org = caseData.org;
    const in_new_member = caseData.nonmember;
    const in_admin = caseData.member;

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await assignMember(in_org.id, in_new_member.id, "Invited", cookie);
    const read_req = await getMemberRole(in_org.id, in_new_member.id, cookie);
    const result = await read_req.json();

    expect(send_req.status).to.eq(200);
    expect(read_req.status).eq(200);
    expect(result.role).to.eq("Invited");
  });

  it("should not be able to add org member without inviting", async () => {
    const in_org = caseData.org;
    const in_new_member = caseData.nonmember;
    const in_admin = caseData.member;

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await assignMember(in_org.id, in_new_member.id, "Admin", cookie);

    expect(send_req.status).to.eq(401);
  });

  it("should not be able to invite as a non admin", async () => {
    const in_org = caseData.org;
    const in_new_member = caseData.nonmember;
    const in_admin = caseData.nonmember;

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await assignMember(in_org.id, in_new_member.id, "Invited", cookie);

    expect(send_req.status).to.eq(401);
  });

  it("should be able to accept invitation", async () => {
    const in_org = caseData.org;
    const in_admin = caseData.member;
    const in_new_member = caseData.nonmember;

    const cookie_admin = await getLoginCookie(in_admin.name, in_admin.password);
    const invite_req = await assignMember(in_org.id, in_new_member.id, "Invited", cookie_admin);

    const cookie_invited = await getLoginCookie(in_new_member.name, in_new_member.password);
    const accept_req = await assignMember(in_org.id, in_new_member.id, "Admin", cookie_invited);
    const result = await accept_req.json();

    expect(invite_req.status).to.eq(200);
    expect(accept_req.status).eq(200);
    expect(result.role).to.eq("Admin");
  });

  it("should be able to unassign org member", async () => {
    const cookie = await getLoginCookie(caseData.member.name, caseData.member.password);
    const in_org = caseData.org;
    const in_member = caseData.member;

    const send_req = await unassignMember(in_org.id, in_member.id, cookie);
    const read_req = await getMemberRole(in_org.id, in_member.id, cookie);
    const result = await read_req.json();

    expect(send_req.status).to.eq(200);
    expect(read_req.status).eq(200);
    expect(result.role).to.eq("Not Involved");
  });

  it("should be able to get org member information", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);
    const in_org = caseData.org;
    const in_member = caseData.nonmember;

    const read_req = await getMemberRole(in_org.id, in_member.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result.role).to.eq("Not Involved");
  });
});

function getOrgs(cookie: string) {
  return new APIContext("OrgsGet").fetch(`/api/orgs/`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function addOrg(
  org: {
    org_address: string;
    org_description: string;
    org_name: string;
    org_phone: string;
  },
  cookie: string,
) {
  return new APIContext("OrgsPost").fetch(`/api/orgs/`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: org,
  });
}

function updateOrg(
  org_id: number,
  org_data: {
    org_name?: string | undefined;
    org_description?: string | undefined;
    org_address?: string | undefined;
    org_phone?: string | undefined;
    org_image?: string | undefined;
    org_categories?: number[] | undefined;
  },
  cookie: string,
) {
  return new APIContext("OrgsUpdate").fetch(`/api/orgs/${org_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "put",
    body: org_data,
  });
}

function getOrgDetail(org_id: number, cookie: string) {
  return new APIContext("OrgsDetailGet").fetch(`/api/orgs/${org_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function deleteOrg(org_id: number, cookie: string) {
  return new APIContext("OrgsDelete").fetch(`/api/orgs/${org_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "delete",
  });
}

function assignMember(org_id: number, user_id: number, role: OrgRoles, cookie: string) {
  return new APIContext("OrgsDetailMembersDetailPut").fetch(
    `/api/orgs/${org_id}/users/${user_id}`,
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
function getMemberRole(org_id: number, user_id: number, cookie: string) {
  return new APIContext("OrgsDetailMembersDetailGet").fetch(
    `/api/orgs/${org_id}/users/${user_id}`,
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
  return new APIContext("OrgsDetailMembersDetailDelete").fetch(
    `/api/orgs/${project_id}/users/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "delete",
    },
  );
}
