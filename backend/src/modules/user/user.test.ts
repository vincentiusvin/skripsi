import { expect } from "chai";
import { Kysely } from "kysely";
import { describe } from "mocha";
import { Application } from "../../app.js";
import { DB } from "../../db/db_types.js";
import { sleep } from "../../helpers/misc.js";
import { TransactionManager } from "../../helpers/transaction/transaction.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { MockedEmailService } from "../email/MockedEmailService.js";
import { UserService, userServiceFactory } from "./UserService.js";

describe("users api", () => {
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
    const { result } = await res.json();
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

  it("should be able to add user with verified otp and login as them", async () => {
    const in_otp = caseData.verified_otp;
    const in_obj: Parameters<typeof addUser>[0] = {
      registration_token: in_otp.token,
      user_name: "testing_name",
      user_password: "testing_password",
      user_email: in_otp.email,
      user_about_me: "saya suka makan ayam",
      user_education_level: "S1",
      user_school: "NUBIS University",
      user_website: "https://www.example.com",
      user_location: "Jakarta",
      user_workplace: "Kantor",
      user_socials: ["https://github.com/testing-name"],
    };

    const send_req = await addUser(in_obj);
    const result = await send_req.json();
    const success_login = await getLoginCookie(in_obj.user_name, in_obj.user_password);

    const expected_obj = {
      ...in_obj,
      registration_token: undefined,
      user_password: undefined,
      user_socials: in_obj.user_socials?.map((x) => ({
        social: x,
      })),
    };
    delete expected_obj.user_password;
    delete expected_obj.registration_token;

    expect(send_req.status).eq(201);
    expect(success_login).to.not.eq("");
    expect(result).to.deep.include(expected_obj);
  });

  const update_cases = [
    {
      key: "plain_user",
      name: "should be able to update user info",
      obj: {
        user_name: "testing_name",
        user_about_me: "saya suka makan ayam",
        user_education_level: "S1",
        user_school: "NUBIS University",
        user_website: "https://www.example.com",
        user_socials: ["https://github.com/testing-name"] as string[],
        user_location: "Jakarta",
        user_workplace: "Kantor",
      },
      ok: true,
    },
    {
      key: "plain_user",
      name: "should not be able to duplicate links",
      obj: {
        user_socials: [
          "https://github.com/testing-name",
          "https://github.com/testing-name",
        ] as string[],
      },
      ok: false,
    },
    {
      key: "plain_user",
      name: "should not be able to insert non links to socials",
      obj: {
        user_socials: ["ini bukan link"] as string[],
      },
      ok: false,
    },
    {
      key: "plain_user",
      name: "should not be able to insert non links to website",
      obj: {
        user_website: "www.example.com",
      },
      ok: false,
    },
  ] as const;

  for (const { key, name, obj, ok } of update_cases) {
    it(name, async () => {
      const in_user = caseData[key];
      const in_obj: Parameters<typeof putUser>[1] = obj;

      const cookie = await getLoginCookie(in_user.name, in_user.password);

      const update_req = await putUser(in_user.id, in_obj, cookie);

      const read_req = await getUserDetail(in_user.id);
      const result = await read_req.json();

      const expected_obj = {
        ...in_obj,
        user_socials:
          in_obj.user_socials?.map((x) => ({
            social: x,
          })) ?? [],
      };

      if (ok) {
        expect(update_req.status).eq(200);
        expect(result).to.deep.include(expected_obj);
      } else {
        expect(update_req.status).to.be.oneOf([400, 401]);
      }
    });
  }

  const reset_password_cases = [
    {
      key: "plain_user",
      name: "should be able to update user password while logged in",
      password: "new pass from update",
      ok: true,
      credentials: { type: "cookie" },
    },
    {
      key: "plain_user",
      name: "should be able to update user password using token",
      password: "new pass from update",
      ok: true,
      credentials: { type: "token", key: "password_otp" },
    },
    {
      key: "plain_user",
      name: "shouldn't be able to update user password with unrelated token",
      password: "new pass from update",
      ok: false,
      credentials: { type: "token", key: "verified_otp" },
    },
  ] as const;

  for (const { key, name, password, ok, credentials } of reset_password_cases) {
    it(name, async () => {
      const in_user = caseData[key];
      const in_pass = password;
      let in_creds: { cookie: string } | { token: string };

      if (credentials.type === "token") {
        in_creds = {
          token: caseData[credentials.key].token,
        };
      } else if (credentials.type === "cookie") {
        const cookie = await getLoginCookie(in_user.name, in_user.password);
        in_creds = { cookie };
      } else {
        throw new Error("Invalid test case data! Please provide a credential");
      }

      const update_req = await putUserPassword(
        in_user.id,
        {
          user_password: in_pass,
        },
        in_creds,
      );

      const success_login = await getLoginCookie(in_user.name, in_pass);

      if (ok) {
        expect(update_req.status).eq(200);
        expect(success_login).to.not.eq("");
      } else {
        expect(update_req.status).not.eq(200);
        expect(success_login).to.eq("");
      }
    });
  }

  it("should be able to verify otp", async () => {
    const in_otp = caseData.unverified_otp;

    const send_req = await verifyOTP(
      {
        otp: in_otp.otp,
      },
      in_otp.token,
    );
    await send_req.json();

    expect(send_req.status).to.eq(200);
  });

  const update_email_cases = [
    {
      name: "should be able to update email using token",
      key: "plain_user",
      otp_key: "verified_otp",
      ok: true,
    },
    {
      name: "shouldn't be able to update email using other token",
      key: "plain_user",
      otp_key: "unverified_otp",
      ok: false,
    },
  ] as const;

  for (const { name, key, otp_key, ok } of update_email_cases) {
    it(name, async () => {
      const in_user = caseData[key];
      const in_otp = caseData[otp_key];

      const cookie = await getLoginCookie(in_user.name, in_user.password);

      const update_req = await putUserEmail(
        in_user.id,
        {
          user_email: in_otp.email,
          token: in_otp.token,
        },
        cookie,
      );

      const read_req = await getUserDetail(in_user.id);
      const result = await read_req.json();

      const expected_obj = {
        user_email: in_otp.email,
      };

      if (ok) {
        expect(update_req.status).eq(200);
        expect(result).to.deep.include(expected_obj);
      } else {
        expect(update_req.status).to.not.eq(200);
        expect(result).to.not.deep.include(expected_obj);
      }
    });
  }

  const otp_query_case = [
    {
      name: "should be able to query user by email if otp is verified",
      key: "verified_otp",
      ok: true,
    },
    {
      name: "shouldn't be able to query user by email if otp is unverified",
      key: "unverified_otp",
      ok: false,
    },
    {
      name: "shouldn't be able to query user by email if otp is used",
      key: "used_otp",
      ok: false,
    },
  ] as const;

  for (const { ok, name, key } of otp_query_case) {
    it(name, async () => {
      const in_otp = caseData[key];

      const otp_req = await getOTPUser(in_otp.token);
      await otp_req.json();

      if (ok == true) {
        expect(otp_req.status).to.eq(200);
      } else {
        expect(otp_req.status).to.be.oneOf([400, 401]);
      }
    });
  }
});

describe("user service", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  let service: UserService;
  let mocked_email: MockedEmailService;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app.db);
    caseData = await baseCase(app.db);
    const { email, user } = getMockedUserService(app.db);
    mocked_email = email;
    service = user;
  });

  it("should be able to send email on otp", async () => {
    const in_otp = caseData.unverified_otp;
    const expected_otp = in_otp.otp;

    await service.sendOTPMail(in_otp.token);

    const found_otp = mocked_email.mails.find((x) => {
      return x.text_content.includes(expected_otp);
    });
    expect(found_otp).to.not.eq(undefined);
  });

  const insert_otp_cases = [
    {
      type: "Register",
      user_key: undefined,
      name: "should be able to insert registration otp",
      ok: true,
    },
    {
      type: "Password",
      user_key: "plain_user",
      name: "should be able to insert password otp",
      ok: true,
    },
    {
      type: "Register",
      user_key: "plain_user",
      name: "shouldn't be able to insert registration otp for used email",
      ok: false,
    },
    {
      type: "Password",
      user_key: undefined,
      name: "shouldn't be able to insert password otp for unregistered email",
      ok: false,
    },
  ] as const;

  for (const { ok, type, name, user_key } of insert_otp_cases) {
    it(name, async () => {
      const in_email =
        user_key !== undefined ? caseData[user_key].email : "otp-test-insert@example.com";

      let isThrown = false;
      let token: string | undefined = undefined;
      try {
        const ret = await service.addOTP({ email: in_email, type });
        token = ret.token;
      } catch (e) {
        isThrown = true;
      }

      await sleep(20);

      if (ok) {
        const found_mail = mocked_email.mails.find((x) => {
          const right_email = x.target === in_email;
          const has_code = /[0-9]{6}/.test(x.text_content);
          return has_code && right_email;
        });
        const otp = await service.getOTP(token!);

        expect(token).to.not.eq(undefined);
        expect(otp.email).to.eq(in_email);
        expect(otp.type).to.eq(type);
        expect(found_mail).to.not.eq(undefined);
      } else {
        expect(isThrown).to.eq(true);
      }
    });
  }

  it("shouldn't be able to resend email on verified otp", async () => {
    const in_otp = caseData.verified_otp;
    const expected_otp = in_otp.otp;
    let thrown = false;

    try {
      await service.sendOTPMail(in_otp.token);
    } catch (e) {
      thrown = true;
    }

    const found_otp = mocked_email.mails.find((x) => {
      return x.text_content.includes(expected_otp);
    });
    expect(thrown).to.eq(true);
    expect(found_otp).to.eq(undefined);
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
    user_name?: string;
    user_education_level?: string;
    user_school?: string;
    user_about_me?: string;
    user_image?: string;
    user_website?: string;
    user_socials?: string[];
    user_location?: string;
    user_workplace?: string;
  },
  cookie: string,
) {
  return new APIContext("UsersDetailPut").fetch(`/api/users/${user_id}`, {
    method: "PUT",
    body,
    headers: {
      cookie,
    },
  });
}

function putUserPassword(
  user_id: number,
  body: {
    user_password: string;
  },
  creds:
    | {
        cookie: string;
      }
    | {
        token: string;
      },
) {
  let headers: { cookie: string } | undefined = undefined;
  const bodyWithToken: {
    user_password: string;
    token?: string;
  } = body;

  if ("cookie" in creds) {
    headers = { cookie: creds.cookie };
  } else if ("token" in creds) {
    bodyWithToken.token = creds.token;
  }

  return new APIContext("UsersDetailPutPassword").fetch(`/api/users/${user_id}/password`, {
    method: "PUT",
    body: bodyWithToken,
    headers,
  });
}

function putUserEmail(
  user_id: number,
  body: {
    user_email: string;
    token: string;
  },
  cookie: string,
) {
  return new APIContext("UsersDetailPutEmail").fetch(`/api/users/${user_id}/email`, {
    method: "PUT",
    body,
    headers: {
      cookie,
    },
  });
}

function getUserDetail(user_id: number) {
  return new APIContext("UsersDetailGet").fetch(`/api/users/${user_id}`, {
    method: "GET",
  });
}

function getOTPUser(token: string) {
  return new APIContext("OTPDetailGetUser").fetch(`/api/otps/${token}/user`, {
    method: "GET",
  });
}

function verifyOTP(body: { otp: string }, token: string) {
  return new APIContext("OTPDetailPut").fetch(`/api/otps/${token}`, {
    method: "PUT",
    body,
  });
}

function addUser(body: {
  user_name: string;
  user_password: string;
  user_email: string;
  user_education_level?: string;
  user_school?: string;
  user_about_me?: string;
  user_image?: string;
  user_website?: string;
  user_socials?: string[];
  user_location?: string;
  user_workplace?: string;
  registration_token: string;
}) {
  return new APIContext("UsersPost").fetch("/api/users", {
    method: "POST",
    body,
  });
}

function getMockedUserService(db: Kysely<DB>) {
  const tm = new TransactionManager(db);
  const email_service = new MockedEmailService();
  return {
    user: userServiceFactory(tm, email_service),
    email: email_service,
  };
}
