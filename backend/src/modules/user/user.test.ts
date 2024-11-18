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
        user_password: "testing_password",
        user_email: "testing-actual-test@example.com",
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
        user_password: undefined,
        user_socials: in_obj.user_socials?.map((x) => ({
          social: x,
        })),
      };
      delete expected_obj.user_password;

      if (ok) {
        expect(update_req.status).eq(200);
        expect(result).to.deep.include(expected_obj);
      } else {
        expect(update_req.status).to.be.oneOf([400, 401]);
      }
    });
  }

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

  it("should be able to verify otp", async () => {
    const in_otp = caseData.unverified_otp;

    const send_req = await verifyOTP({
      token: in_otp.token,
      otp: in_otp.otp,
    });
    await send_req.json();

    expect(send_req.status).to.eq(200);
  });
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

  it("should be able to insert new otp", async () => {
    const in_email = "otp-test-insert@example.com";

    await service.addRegistrationOTP({ email: in_email });
    await sleep(20);

    const found_otp = mocked_email.mails.find((x) => {
      const right_email = x.target === in_email;
      const has_code = /[0-9]{6}/.test(x.text_content);
      return has_code && right_email;
    });
    expect(found_otp).to.not.eq(undefined);
  });

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
    user_password?: string;
    user_email?: string;
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

function verifyOTP(body: { token: string; otp: string }) {
  return new APIContext("OTPsPut").fetch("/api/otps", {
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
