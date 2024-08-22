import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("friend api", () => {
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

    const read_req = await putFriend(in_from.id, in_to.id, "Sent", cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result.status).to.eq("Sent");
  });

  const accept_cases = [
    {
      us: "friend_acc_user",
      them: "friend_recv_user",
      description: "unrelated",
      ok: false,
    },
    {
      us: "friend_send_user",
      them: "friend_recv_user",
      description: "sender",
      ok: false,
    },
    {
      us: "friend_recv_user",
      them: "friend_send_user",
      description: "receiver",
      ok: true,
    },
  ] as const;

  for (const { us, them, ok, description } of accept_cases) {
    it(`${
      ok ? "should" : "shouldn't"
    } be able to accept friend request as ${description}`, async () => {
      const in_us = caseData[us];
      const in_them = caseData[them];
      const cookie = await getLoginCookie(in_us.name, in_them.password);

      const read_req = await putFriend(in_us.id, in_them.id, "Accepted", cookie);
      const result = await read_req.json();

      if (ok) {
        expect(read_req.status).eq(200);
        expect(result.status).to.eq("Accepted");
      } else {
        expect(read_req.status).eq(400);
      }
    });
  }

  const test_cases = [
    {
      us: "friend_recv_user",
      them: "friend_acc_user",
      status: "None",
      description: "no",
    },
    {
      us: "friend_recv_user",
      them: "friend_send_user",
      status: "Pending",
      description: "incoming",
    },
    {
      us: "friend_send_user",
      them: "friend_recv_user",
      status: "Sent",
      description: "outgoing",
    },
    {
      us: "friend_send_user",
      them: "friend_acc_user",
      status: "Accepted",
      description: "accepted outgoing",
    },
    {
      us: "friend_acc_user",
      them: "friend_send_user",
      status: "Accepted",
      description: "accepted incoming",
    },
  ] as const;

  for (const { us, them, status, description } of test_cases) {
    it(`should be able to represent ${description} friend request as ${status}`, async () => {
      const in_us = caseData[us];
      const in_them = caseData[them];
      const expected_status = status;

      const cookie = await getLoginCookie(in_us.name, in_us.password);
      const read_req = await getFriend(in_us.id, in_them.id, cookie);
      const result = await read_req.json();

      expect(read_req.status).eq(200);
      expect(result.status).to.eq(expected_status);
    });
  }

  const unfriend_cases = [
    {
      us: "friend_acc_user",
      them: "friend_send_user",
      description: "receiver",
      ok: true,
    },
    {
      us: "friend_send_user",
      them: "friend_acc_user",
      description: "sender",
      ok: true,
    },
    {
      us: "friend_recv_user",
      them: "friend_acc_user",
      description: "unrelated",
      ok: false,
    },
  ] as const;

  for (const { us, them, description, ok } of unfriend_cases) {
    it(`${ok ? "should" : "shouldn't"} be able to unfriend people as ${description}`, async () => {
      const in_us = caseData[us];
      const in_them = caseData[them];

      const cookie = await getLoginCookie(in_us.name, in_us.password);
      const send_req = await deleteFriend(in_us.id, in_them.id, cookie);

      const read_req = await getFriend(in_us.id, in_them.id, cookie);
      const result = await read_req.json();

      if (ok) {
        expect(send_req.status).eq(200);
        expect(result.status).to.eq("None");
      } else {
        expect(send_req.status).eq(400);
      }
    });
  }
});

function putFriend(from_id: number, to_id: number, status: "Accepted" | "Sent", cookie: string) {
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

function deleteFriend(from_id: number, to_id: number, cookie: string) {
  return new APIContext("UserDetailFriendDetailDelete").fetch(
    `/api/users/${from_id}/friends/${to_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "delete",
    },
  );
}

function getFriend(from_id: number, to_id: number, cookie: string) {
  return new APIContext("UserDetailFriendDetailGet").fetch(
    `/api/users/${from_id}/friends/${to_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    },
  );
}
