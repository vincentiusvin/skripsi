import { expect } from "chai";
import { before, describe } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("chatting api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;

  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });

  it("should be able to update and view chatroom detail", async () => {
    const in_name = "new chatroom name";
    const in_chat = caseData.chat;
    const in_user = caseData.chat_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await updateRoom(in_chat.id, { name: in_name }, cookie);
    expect(send_req.status).to.eq(200);

    const read_req = await getChatroomDetail(in_chat.id, cookie);
    const result = await read_req.json();
    expect(result.chatroom_name).to.eq(in_name);
  });

  it("should be able to add and get user chats", async () => {
    const in_user = caseData.plain_user;
    const in_chatroom_name = "user's chatroom";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addUserChatroom(in_user.id, in_chatroom_name, cookie);
    expect(send_req.status).to.eq(201);

    const read_req = await getUserChatrooms(in_user.id, cookie);
    const result = await read_req.json();
    const found = result.find((x) => x.chatroom_name === in_chatroom_name);
    expect(found).to.not.eq(undefined);
  });

  it("should be able to add and get project chat", async () => {
    const in_user = caseData.dev_user;
    const in_project = caseData.project;
    const in_chatroom_name = "project's chatroom";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addProjectChatroom(in_project.id, in_chatroom_name, cookie);
    expect(send_req.status).eq(201);

    const read_req = await getProjectChatroom(in_project.id, cookie);
    const result = await read_req.json();
    const found = result.find((x) => x.chatroom_name === in_chatroom_name);
    expect(found).to.not.eq(undefined);
  });

  it("should be able to send and view messages", async () => {
    const in_user = caseData.chat_user;
    const in_chat = caseData.chat;
    const in_message = "Hello testing!";

    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const send_req = await sendMessage(in_chat.id, in_message, cookie);
    expect(send_req.status).to.eq(201);

    const read_req = await getChatroomMessages(caseData.chat.id, cookie);
    const result = await read_req.json();
    const sent_message = result.find((x) => x.message === in_message);

    expect(read_req.status).to.eq(200);
    expect(sent_message).to.not.eq(undefined);
    expect(sent_message?.user_id).to.eq(in_user.id);
  });

  it("should be able to update messages", async () => {
    const in_user = caseData.chat_user;
    const in_chat = caseData.chat;
    const in_message = caseData.message;
    const in_edited = "new edited message text";

    const cookie = await getLoginCookie(in_user.name, in_user.password);

    const send_req = await updateMessage(in_chat.id, in_message.id, in_edited, cookie);
    const send_result = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(send_result.id).to.eq(in_message.id);
    expect(send_result.message).to.eq(in_edited);
  });

  it("should reject unauthorized viewers", async () => {
    const in_member = caseData.org_user;

    const cookie = await getLoginCookie(in_member.name, in_member.password);
    const read_req = await getChatroomMessages(caseData.chat.id, cookie);

    expect(read_req.status).to.eq(401);
  });
});

function getUserChatrooms(user_id: number, cookie: string) {
  return new APIContext("UsersDetailChatroomsGet").fetch(`/api/users/${user_id}/chatrooms`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function addUserChatroom(user_id: number, chatroom_name: string, cookie: string) {
  return new APIContext("ProjectsDetailChatroomsPost").fetch(`/api/users/${user_id}/chatrooms`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: {
      name: chatroom_name,
    },
  });
}
function getProjectChatroom(project_id: number, cookie: string) {
  return new APIContext("ProjectsDetailChatroomsGet").fetch(
    `/api/projects/${project_id}/chatrooms`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    },
  );
}

function addProjectChatroom(project_id: number, chatroom_name: string, cookie: string) {
  return new APIContext("ProjectsDetailChatroomsPost").fetch(
    `/api/projects/${project_id}/chatrooms`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "post",
      body: {
        name: chatroom_name,
      },
    },
  );
}

function getChatroomDetail(chatroom_id: number, cookie: string) {
  return new APIContext("ChatroomsDetailGet").fetch(`/api/chatrooms/${chatroom_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function getChatroomMessages(chatroom_id: number, cookie: string) {
  return new APIContext("ChatroomsDetailMessagesGet").fetch(
    `/api/chatrooms/${chatroom_id}/messages`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    },
  );
}

function sendMessage(chatroom_id: number, message: string, cookie: string) {
  return new APIContext("ChatroomsDetailMessagesPost").fetch(
    `/api/chatrooms/${chatroom_id}/messages`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "post",
      body: {
        message: message,
      },
    },
  );
}

function updateMessage(chatroom_id: number, message_id: number, message: string, cookie: string) {
  return new APIContext("ChatroomsDetailMessagesPost").fetch(
    `/api/chatrooms/${chatroom_id}/messages/${message_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "put",
      body: {
        message: message,
      },
    },
  );
}

function updateRoom(
  chatroom_id: number,
  opts: { name?: string; user_ids?: number[] },
  cookie: string,
) {
  return new APIContext("ChatroomsDetailPut").fetch(`/api/chatrooms/${chatroom_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "put",
    body: {
      name: opts.name,
      user_ids: opts.user_ids,
    },
  });
}
