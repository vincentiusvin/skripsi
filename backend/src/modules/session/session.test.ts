import { expect } from "chai";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("session api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to login as user", async () => {
    const in_user = caseData.plain_user;
    const success_login = await login(in_user.name, in_user.password);
    expect(success_login.status).to.eq(200);
  });

  it("should reject wrong password", async () => {
    const in_user = caseData.plain_user;
    const failed_login = await login(in_user.name, in_user.password + "abc");
    expect(failed_login.status).to.eq(400);
  });

  it("should reject wrong user", async () => {
    const in_user = caseData.plain_user;
    const failed_login = await login(in_user.name + "abc", in_user.password);
    expect(failed_login.status).to.eq(400);
  });

  it("should be able to get session info", async () => {
    const in_user = caseData.plain_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getStatus(cookie);
    const result = await read_req.json();

    expect(result.logged).to.eq(true);
    if (result.logged === true) {
      expect(result.user_name).to.eq(in_user.name);
    }
  });

  it("should be able logout", async () => {
    const in_user = caseData.plain_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await logout(cookie);
    await send_req.json();
    const read_req = await getStatus(cookie);
    const result = await read_req.json();

    expect(result.logged).to.eq(false);
  });
});

function login(user_name: string, user_password: string) {
  return new APIContext("SessionPut").fetch(`/api/session`, {
    method: "put",
    body: {
      user_name,
      user_password,
    },
  });
}

function getStatus(cookie: string) {
  return new APIContext("SessionGet").fetch(`/api/session`, {
    method: "get",
    headers: {
      cookie: cookie,
    },
    credentials: "include",
  });
}

function logout(cookie: string) {
  return new APIContext("SessionGet").fetch(`/api/session`, {
    method: "delete",
    headers: {
      cookie: cookie,
    },
    credentials: "include",
  });
}
