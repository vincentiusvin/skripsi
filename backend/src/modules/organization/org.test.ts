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

    const res = await new APIContext("OrgsGet").fetch(`/api/orgs/`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    });
    expect(res.status).eq(200);
    const result = await res.json();
    const expected_id = caseData.org.id;
    const found_org = result.find((x) => x.org_id === expected_id);
    expect(found_org).to.not.eq(undefined);
    expect(found_org?.org_name).to.eq(caseData.org.name);
  });

  it("should be able to post org", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const in_name = "Test Case";
    const in_addr = "Tangerang";
    const in_phone = "123";
    const in_desc = "Hello";

    const res = await new APIContext("OrgsPost").fetch(`/api/orgs/`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "post",
      body: {
        org_address: in_addr,
        org_description: in_desc,
        org_name: in_name,
        org_phone: in_phone,
      },
    });
    expect(res.status).eq(201);
    await res.json();

    const res2 = await new APIContext("OrgsGet").fetch(`/api/orgs/`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    });
    expect(res2.status).eq(200);

    const result = await res2.json();
    const found_org = result.find((x) => x.org_name === in_name);

    expect(found_org).to.not.eq(undefined);
    expect(found_org?.org_description).to.eq(in_desc);
  });

  it("should be able to update and get detail", async () => {
    const cookie = await getLoginCookie(caseData.nonmember.name, caseData.nonmember.password);

    const in_name = "new_name";
    const in_addr = "new_place";

    const res = await new APIContext("OrgsUpdate").fetch(`/api/orgs/${caseData.org.id}`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "put",
      body: {
        org_name: in_name,
        org_address: in_addr,
      },
    });
    expect(res.status).eq(200);
    await res.json();

    const res2 = await new APIContext("OrgsDetailGet").fetch(`/api/orgs/${caseData.org.id}`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    });

    expect(res2.status).eq(200);
    const result = await res2.json();

    expect(result.org_name).eq(in_name);
    expect(result.org_address).eq(in_addr);
  });

  it("should be able to delete", async () => {
    const cookie = await getLoginCookie(caseData.member.name, caseData.member.password);

    const res = await new APIContext("OrgsDelete").fetch(`/api/orgs/${caseData.org.id}`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "delete",
    });
    expect(res.status).to.eq(200);

    const res2 = await new APIContext("OrgsGet").fetch(`/api/orgs/`, {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    });
    expect(res2.status).eq(200);
    const result = await res2.json();
    const found_org = result.find((x) => x.org_id === caseData.org.id);
    expect(found_org).to.eq(undefined);
  });
});
