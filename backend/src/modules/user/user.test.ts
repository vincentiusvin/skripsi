import { expect } from "chai";
import { describe } from "mocha";
import { Application } from "../../app.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("users api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;

  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app.db);
    caseData = await baseCase(app.db);
  });

  it("should be able to get user", async () => {
    const in_user = caseData.plain_user;

    const res = await getUsers();
    const result = await res.json();
    const found = result.find((x) => x.user_id === in_user.id);

    expect(res.status).eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.user_name).to.eq(in_user.name);
  });

  it("should be able to get user detail", async () => {
    const in_user = caseData.plain_user;

    const res = await getUserDetail(in_user.id);
    const result = await res.json();

    expect(res.status).eq(200);
    expect(result).to.not.eq(undefined);
    expect(result.user_name).to.eq(in_user.name);
  });

  it("should be able to add user and login as them", async () => {
    const in_obj: Parameters<typeof addUser>[0] = {
      user_name: "testing_name",
      user_password: "testing_password",
      user_email: "testing-actual-test@example.com",
      user_about_me: "saya suka makan ayam",
      user_education_level: "S1",
      user_school: "NUBIS University",
      user_website: "https://www.example.com",
    };

    const send_req = await addUser(in_obj);
    const result = await send_req.json();
    const success_login = await getLoginCookie(in_obj.user_name, in_obj.user_password);

    const expected_obj = { ...in_obj, user_password: undefined };
    delete expected_obj.user_password;

    expect(send_req.status).eq(201);
    expect(success_login).to.not.eq("");
    expect(result).to.deep.include(expected_obj);
  });

  it("should be able to update user info", async () => {
    const in_user = caseData.plain_user;
    const in_obj: Parameters<typeof putUser>[1] = {
      user_name: "testing_name",
      user_password: "testing_password",
      user_email: "testing-actual-test@example.com",
      user_about_me: "saya suka makan ayam",
      user_education_level: "S1",
      user_school: "NUBIS University",
      user_website: "https://www.example.com",
    };

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const update_req = await putUser(in_user.id, in_obj, cookie);

    const read_req = await getUserDetail(in_user.id);
    const result = await read_req.json();

    const expected_obj = { ...in_obj, user_password: undefined };
    delete expected_obj.user_password;

    expect(update_req.status).eq(200);
    expect(result).to.deep.include(expected_obj);
  });

  it("should be able to update user password", async () => {
    const in_user = caseData.plain_user;
    const in_pass = "new pass from update";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const update_req = await putUser(
      in_user.id,
      {
        user_password: in_pass,
      },
      cookie,
    );

    const success_login = await getLoginCookie(in_user.name, in_pass);

    expect(update_req.status).eq(200);
    expect(success_login).to.not.eq("");
  });
});

function getUsers() {
  return new APIContext("UsersGet").fetch("/api/users", {
    method: "GET",
  });
}

function putUser(
  user_id: number,
  body: {
    user_name?: string | undefined;
    user_password?: string | undefined;
    user_email?: string | undefined;
    user_education_level?: string | undefined;
    user_school?: string | undefined;
    user_about_me?: string | undefined;
    user_image?: string | undefined;
    user_website?: string | undefined;
  },
  cookie: string,
) {
  return new APIContext("UsersDetailPut").fetch(`/api/users/${user_id}`, {
    method: "PUT",
    body: body,
    headers: {
      cookie: cookie,
    },
  });
}

function getUserDetail(user_id: number) {
  return new APIContext("UsersDetailGet").fetch(`/api/users/${user_id}`, {
    method: "GET",
  });
}

function addUser(body: {
  user_name: string;
  user_password: string;
  user_email: string;
  user_education_level?: string | undefined;
  user_school?: string | undefined;
  user_about_me?: string | undefined;
  user_image?: string | undefined;
  user_website?: string | undefined;
}) {
  return new APIContext("UsersPost").fetch("/api/users", {
    method: "POST",
    body,
  });
}
