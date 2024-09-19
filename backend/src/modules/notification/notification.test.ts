import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("notification api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to get notifications", async () => {
    const in_user = caseData.notif_user;
    const in_notif = caseData.notifications[0];

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getNotifications(in_user.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).to.eq(200);
    const found = result.find((x) => x.id === in_notif.id);
    expect(found).to.not.eq(undefined);
    expect(found?.title).to.eq(in_notif.title);
  });

  it("should be able to set notification read", async () => {
    const in_user = caseData.notif_user;
    const in_notif = caseData.notifications[0];
    const in_status = true;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await putNotifications(in_notif.id, in_status, cookie);
    await send_req.json();
    const read_req = await getNotifications(in_user.id, cookie);
    const result = await read_req.json();

    expect(send_req.status).to.eq(200);
    const found = result.find((x) => x.id === in_notif.id);
    expect(found).to.not.eq(undefined);
    expect(found?.read).to.eq(in_status);
  });
});

function getNotifications(user_id: number, cookie: string) {
  return new APIContext("NotificationsGet").fetch(`/api/notifications`, {
    headers: {
      cookie: cookie,
    },
    query: {
      user_id: user_id.toString(),
    },
    credentials: "include",
    method: "get",
  });
}

function putNotifications(notification_id: number, read: boolean, cookie: string) {
  return new APIContext("NotificationsPut").fetch(`/api/notifications/${notification_id}`, {
    headers: {
      cookie: cookie,
    },
    body: {
      read,
    },
    credentials: "include",
    method: "put",
  });
}
