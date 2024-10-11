import { expect } from "chai";
import { Kysely } from "kysely";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { DB } from "../../db/db_types.js";
import { getNotifications } from "../../test/NotificationTester.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { MockedEmailService } from "../email/MockedEmailService.js";
import { UserRepository } from "../user/UserRepository.js";
import { UserService } from "../user/UserService.js";
import { NotificationTypes } from "./NotificationMisc.js";
import { NotificationRepository } from "./NotificationRepository.js";
import { NotificationService } from "./NotificationService.js";

describe("notification api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
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

describe("notification service", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  let service: NotificationService;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
    service = getMockedEmailNotificationService(app.db);
  });

  it("should be able to add notifications", async () => {
    const in_user = caseData.notif_user;
    const in_data: {
      title: string;
      description: string;
      type: NotificationTypes;
      user_id: number;
    } = {
      title: "Notif baru",
      description: "halo",
      type: "GeneralChat",
      user_id: in_user.id,
    };

    const id = await service.addNotification(in_data);
    if (!id) {
      throw new Error("Failed to insert notification!");
    }
    const notif = await service.getNotification(id.id);

    expect(notif).to.not.eq(undefined);
    expect(notif).to.deep.include(in_data);
  });
});

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

function getMockedEmailNotificationService(db: Kysely<DB>) {
  const notif_repo = new NotificationRepository(db);
  const user_repo = new UserRepository(db);
  const user_service = new UserService(user_repo);
  return new NotificationService(notif_repo, new MockedEmailService(), user_service);
}
