import { expect } from "chai";
import { describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("users api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;

  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to get user", async () => {
    const expected_user = caseData.plain_user;

    const res = await getUsers();
    const result = await res.json();
    const found = result.find((x) => x.user_id === expected_user.id);

    expect(res.status).eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.user_name).to.eq(expected_user.name);
  });

  it("should be able to add user and login as them", async () => {
    const in_name = "testing_name";
    const in_password = "testing_password";

    const send_req = await addUser(in_name, in_password);
    await send_req.json();
    const success_login = await getLoginCookie(in_name, in_password);

    expect(send_req.status).eq(201);
    expect(success_login).to.not.eq("");
  });
});

function getUsers() {
  return new APIContext("UsersGet").fetch("/api/users", {
    method: "GET",
  });
}

function addUser(user_name: string, user_password: string) {
  return new APIContext("UsersPost").fetch("/api/users", {
    method: "POST",
    body: {
      user_name,
      user_password,
    },
  });
}
