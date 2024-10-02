import { expect } from "chai";
import { Application } from "../../app.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("suspension api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("should be able to add bans as admin", async () => {
    const in_admin = caseData.admin_user;
    const in_user = caseData.plain_user;
    const in_data = {
      reason: "Kurang beruntung",
      suspended_until: new Date().toISOString(),
      user_id: in_user.id,
    };

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await addSuspension(in_data, cookie);
    const result = await send_req.json();

    expect(send_req.status).eq(201);
    expect(result).to.deep.include(in_data);
  });

  it("should not be able to add bans as regular_user", async () => {
    const in_admin = caseData.plain_user;
    const in_user = caseData.plain_user;
    const in_data = {
      reason: "Kurang beruntung",
      suspended_until: new Date().toISOString(),
      user_id: in_user.id,
    };

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await addSuspension(in_data, cookie);
    await send_req.json();

    expect(send_req.status).eq(401);
  });

  it("should be able to read bans as admin", async () => {
    const in_admin = caseData.admin_user;
    const in_ban = caseData.bans[0];

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await getSuspensions(cookie);
    const result = await send_req.json();

    expect(send_req.status).eq(200);
    const found = result.find((x) => x.id == in_ban.id);
    const in_ban_serialized = {
      ...in_ban,
      suspended_until: in_ban.suspended_until.toISOString(),
    };
    expect(found).to.deep.include(in_ban_serialized);
  });

  it("should be able to read ban detail as admin", async () => {
    const in_admin = caseData.admin_user;
    const in_ban = caseData.bans[0];

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await getSuspensionDetail(in_ban.id, cookie);
    const result = await send_req.json();

    expect(send_req.status).eq(200);
    const in_ban_serialized = {
      ...in_ban,
      suspended_until: in_ban.suspended_until.toISOString(),
    };
    expect(result).to.deep.include(in_ban_serialized);
  });

  it("should be able to delete ban as admin", async () => {
    const in_admin = caseData.admin_user;
    const in_ban = caseData.bans[0];

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await deleteSuspension(in_ban.id, cookie);
    await send_req.json();
    const read_req = await getSuspensionDetail(in_ban.id, cookie);
    await read_req.json();

    expect(send_req.status).to.eq(200);
    expect(read_req.status).to.eq(404);
  });

  it("should be able to update ban as admin", async () => {
    const in_admin = caseData.admin_user;
    const in_ban = caseData.bans[0];
    const in_data = {
      reason: "Reason baru",
    };

    const cookie = await getLoginCookie(in_admin.name, in_admin.password);
    const send_req = await updateSuspension(in_ban.id, in_data, cookie);
    const result = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(result).to.deep.include(in_data);
  });
});

function addSuspension(
  opts: {
    reason: string;
    suspended_until: string;
    user_id: number;
  },
  cookie: string,
) {
  return new APIContext("SuspensionPost").fetch(`/api/suspensions`, {
    headers: {
      cookie: cookie,
    },
    body: opts,
    credentials: "include",
    method: "post",
  });
}

function updateSuspension(
  suspension_id: number,
  opts: {
    reason?: string;
    suspended_until?: string;
    user_id?: number;
  },
  cookie: string,
) {
  return new APIContext("SuspensionDetailPut").fetch(`/api/suspensions/${suspension_id}`, {
    headers: {
      cookie: cookie,
    },
    body: opts,
    credentials: "include",
    method: "put",
  });
}

function getSuspensions(cookie: string) {
  return new APIContext("SuspensionGet").fetch(`/api/suspensions`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function getSuspensionDetail(suspension_id: number, cookie: string) {
  return new APIContext("SuspensionDetailGet").fetch(`/api/suspensions/${suspension_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function deleteSuspension(suspension_id: number, cookie: string) {
  return new APIContext("SuspensionDetailDelete").fetch(`/api/suspensions/${suspension_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "delete",
  });
}
