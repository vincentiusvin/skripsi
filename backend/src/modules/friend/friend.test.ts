import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("friend api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to send friend request", async () => {
    const in_from = caseData.plain_user;
    const in_to = caseData.dev_user;
    const cookie = await getLoginCookie(in_from.name, in_from.password);

    const read_req = await putFriend(in_from.id, in_to.id, "Pending", cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result.status).to.eq("Sent");
  });
});

function putFriend(from_id: number, to_id: number, status: "Accepted" | "Pending", cookie: string) {
  return new APIContext("UserDetailFriendDetailPut").fetch(
    `/api/users/${from_id}/friends/${to_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "put",
      body: {
        status,
      },
    },
  );
}
