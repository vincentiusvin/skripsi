import { expect } from "chai";
import { Kysely } from "kysely";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { DB } from "../../db/db_types.js";
import { sleep } from "../../helpers/misc.js";
import { TransactionManager } from "../../helpers/transaction/transaction.js";
import { getNotifications } from "../../test/NotificationTester.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { MockedEmailService } from "../email/MockedEmailService.js";
import { preferenceServiceFactory } from "../preferences/PreferenceService.js";
import { envUserServiceFactory } from "../user/UserService.js";
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
    await clearDB(app.db);
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

  it("should be able to mass read notification", async () => {
    const in_user = caseData.notif_user;
    const in_status = true;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await massPutNotifications(in_status, in_user.id, cookie);
    const res = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(res).to.satisfy((x: typeof res) => {
      return x.every((notif) => {
        return notif.read === in_status;
      });
    });
  });
});

describe("notification service", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  let service: NotificationService;
  let mocked_email: MockedEmailService;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app.db);
    caseData = await baseCase(app.db);
    const { email, notif } = getMockedEmailNotificationService(app.db);
    mocked_email = email;
    service = notif;
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
      type: "Diskusi Pribadi",
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

  it("should be able to send email notifications", async () => {
    const in_user = caseData.email_chat_user;
    const in_data: {
      title: string;
      description: string;
      type: NotificationTypes;
      user_id: number;
    } = {
      title: "Notif baru",
      description: "halo",
      type: "Diskusi Pribadi",
      user_id: in_user.id,
    };

    await service.addNotification(in_data);
    await sleep(20);

    expect(mocked_email.called).to.eq(1);
  });

  it("should be able to buffer email notifications when below threshold", async () => {
    const buffer_iter_below_threshold = 4;
    const in_user = caseData.email_chat_user;
    for (let i = 0; i < buffer_iter_below_threshold; i++) {
      const in_data: {
        title: string;
        description: string;
        type: NotificationTypes;
        user_id: number;
      } = {
        title: "Notif baru",
        description: "halo",
        type: "Diskusi Pribadi",
        user_id: in_user.id,
      };

      await service.addNotification(in_data);
    }

    await sleep(20);
    expect(mocked_email.called).to.eq(1);
  });

  it("should be able to buffer email notifications when above threshold", async () => {
    const buffer_iter_above_threshold = 8;
    const in_user = caseData.email_chat_user;
    for (let i = 0; i < buffer_iter_above_threshold; i++) {
      const in_data: {
        title: string;
        description: string;
        type: NotificationTypes;
        user_id: number;
      } = {
        title: "Notif baru",
        description: "halo",
        type: "Diskusi Pribadi",
        user_id: in_user.id,
      };

      await service.addNotification(in_data);
    }

    await sleep(20);
    expect(mocked_email.called).to.eq(2);
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

function massPutNotifications(read: boolean, user_id: number, cookie: string) {
  return new APIContext("NotificationsMassPut").fetch(`/api/notifications`, {
    headers: {
      cookie: cookie,
    },
    query: {
      user_id: user_id.toString(),
    },
    body: {
      read,
    },
    credentials: "include",
    method: "put",
  });
}

function getMockedEmailNotificationService(db: Kysely<DB>) {
  const tm = new TransactionManager(db);
  const notif_repo = new NotificationRepository(db);
  const user_service = envUserServiceFactory(tm);
  const pref_service = preferenceServiceFactory(tm);
  const email_service = new MockedEmailService();
  return {
    notif: new NotificationService(notif_repo, email_service, user_service, pref_service, tm),
    email: email_service,
  };
}
