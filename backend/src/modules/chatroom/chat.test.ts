import { expect } from "chai";
import { before, describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("chatroom controller", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;

  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to get user chats", async () => {
    const cookie = await getLoginCookie(caseData.chatuser.name, caseData.chatuser.password);
    const res = await new APIContext("ProjectsDetailChatroomsGet").fetch(
      `/api/users/${caseData.chatuser.id}/chatrooms`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "get",
      },
    );

    expect(res.status).to.eq(200);
    const result = await res.json();
    const found = result.find((x) => x.chatroom_name === caseData.chat.name);
    expect(found).to.not.eq(undefined);
  });

  it("should be able to add and get project chat", async () => {
    const in_user = caseData.dev_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const in_chatroom_name = "Integration Test Chatroom";

    const res = await new APIContext("ProjectsDetailChatroomsPost").fetch(
      `/api/projects/${caseData.project.id}/chatrooms`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "post",
        body: {
          name: in_chatroom_name,
        },
      },
    );
    expect(res.status).eq(201);
    const chatroom = await res.json();

    const res2 = await new APIContext("ChatroomsDetailGet").fetch(
      `/api/chatrooms/${chatroom.chatroom_id}`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "get",
      },
    );
    const result = await res2.json();

    expect(res2.status).to.eq(200);
    expect(result.chatroom_name).to.eq(in_chatroom_name);
  });

  it("should be able to send and view messages", async () => {
    const in_user = caseData.chatuser;
    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const in_message = "Hello testing!";

    const res = await new APIContext("ChatroomsDetailMessagesPost").fetch(
      `/api/chatrooms/${caseData.chat.id}/messages`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "post",
        body: {
          message: in_message,
        },
      },
    );

    expect(res.status).to.eq(201);

    const res2 = await new APIContext("ChatroomsDetailMessagesGet").fetch(
      `/api/chatrooms/${caseData.chat.id}/messages`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "get",
      },
    );

    expect(res2.status).to.eq(200);
    const result = await res2.json();

    const original_message = result.find((x) => x.message === caseData.message.message);
    expect(original_message).to.not.eq(undefined);
    expect(original_message?.user_id).to.eq(caseData.message.user_id);

    const sent_message = result.find((x) => x.message === in_message);
    expect(sent_message).to.not.eq(undefined);
    expect(sent_message?.user_id).to.eq(in_user.id);
  });

  it("should reject unauthorized viewers", async () => {
    const cookie = await getLoginCookie(caseData.member.name, caseData.member.password);

    const res2 = await new APIContext("ChatroomsDetailMessagesGet").fetch(
      `/api/chatrooms/${caseData.chat.id}/messages`,
      {
        headers: {
          cookie: cookie,
        },
        credentials: "include",
        method: "get",
      },
    );

    expect(res2.status).to.eq(401);
  });
});
