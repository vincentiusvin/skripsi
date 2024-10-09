import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("preference api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("should be able to get preference", async () => {
    const in_user = caseData.pref_user;
    const expected_preferences = caseData.preferences;
    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const read_req = await getPrefs(in_user.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result).to.include(expected_preferences);
  });

  it("should be able to add preference", async () => {
    const in_user = caseData.plain_user;
    const in_data = {
      org_notif: "email",
      msg_notif: "email",
      project_invite: "on",
    } as const;
    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const read_req = await putPrefs(in_user.id, in_data, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result).to.include(in_data);
  });

  it("should be able to update preference after setting value", async () => {
    const in_user = caseData.plain_user;
    const in_data_1 = {
      org_notif: "email",
    } as const;
    const in_data_2 = {
      org_notif: "on",
    } as const;
    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const read_req = await putPrefs(in_user.id, in_data_1, cookie);
    await read_req.json();

    const update_req = await putPrefs(in_user.id, in_data_2, cookie);
    const result = await update_req.json();

    expect(update_req.status).eq(200);
    expect(result).to.include(in_data_2);
  });
});

function getPrefs(user_id: number, cookie: string) {
  return new APIContext("PreferencesGet").fetch(`/api/users/${user_id}/preferences`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function putPrefs(
  user_id: number,
  data: {
    project_invite?: "on" | "off";
    friend_invite?: "on" | "off";
    project_notif?: "off" | "on" | "email";
    org_notif?: "off" | "on" | "email";
    msg_notif?: "off" | "on" | "email";
    report_notif?: "off" | "on" | "email";
    task_notif?: "off" | "on" | "email";
    contrib_notif?: "off" | "on" | "email";
    friend_notif?: "off" | "on" | "email";
  },
  cookie: string,
) {
  return new APIContext("PreferencesPut").fetch(`/api/users/${user_id}/preferences`, {
    headers: {
      cookie: cookie,
    },
    body: data,
    credentials: "include",
    method: "put",
  });
}
