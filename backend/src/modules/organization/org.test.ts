import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

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
    const cookie = await getLoginCookie(caseData.member.name, caseData.member.password);
    const in_org = caseData.org;

    const send_req = await deleteOrg(in_org.id, cookie);
    const read_req = await getOrgs(cookie);
    const result = await read_req.json();
    const found_org = result.find((x) => x.org_id === caseData.org.id);

    expect(send_req.status).to.eq(200);
    expect(read_req.status).eq(200);
    expect(found_org).to.eq(undefined);
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
