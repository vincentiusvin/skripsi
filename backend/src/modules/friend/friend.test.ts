import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { NotificationTester } from "../../test/NotificationTester.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("friend api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("shouldn't be able to duplicate friends", async () => {
    const in_from = caseData.friend_acc_user;
    const in_to = caseData.friend_send_user;

    const cookie = await getLoginCookie(in_from.name, in_from.password);
    const read_req = await putFriend(in_from.id, in_to.id, "Sent", cookie);

    expect(read_req.status).to.eq(400);
  });

  it("should be able to get friends", async () => {
    const in_user = caseData.friend_send_user;
    const expected_friend = caseData.friend_acc_user;
    const expected_status = "Accepted";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getAllFriends(in_user.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    const found = result.find((x) => x.user_id === expected_friend.id);
    expect(found?.status).to.eq(expected_status);
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

  describe("notifications", () => {
    it("should send notification to receiver when a user is invited as friend", async () => {
      const in_us = caseData.friend_send_user;
      const in_them = caseData.plain_user;
      const cookie = await getLoginCookie(in_us.name, in_them.password);

      const nt = await NotificationTester.fromLoginInfo(in_them.id, in_them.name, in_them.password);
      await nt.start();
      const read_req = await putFriend(in_us.id, in_them.id, "Sent", cookie);
      await read_req.json();
      await nt.finish();
      const result = nt.diff();

      expect(result.length).to.eq(1);
    });

    it("should send notification to sender when a user accepts a friend invitation", async () => {
      const in_accepter = caseData.friend_recv_user;
      const in_sender = caseData.friend_send_user;
      const cookie = await getLoginCookie(in_accepter.name, in_sender.password);

      const nt = await NotificationTester.fromLoginInfo(
        in_sender.id,
        in_sender.name,
        in_sender.password,
      );
      await nt.start();
      const read_req = await putFriend(in_accepter.id, in_sender.id, "Accepted", cookie);
      await read_req.json();
      await nt.finish();
      const result = nt.diff();

      expect(result.length).to.eq(1);
    });
  });
});

function putFriend(from_id: number, to_id: number, status: "Accepted" | "Sent", cookie: string) {
  return new APIContext("UsersDetailFriendsDetailPut").fetch(
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
  return new APIContext("UsersDetailFriendsDetailDelete").fetch(
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
  return new APIContext("UsersDetailFriendsDetailGet").fetch(
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

function getAllFriends(user_id: number, cookie: string) {
  return new APIContext("UsersDetailFriendsGet").fetch(`/api/users/${user_id}/friends`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}
