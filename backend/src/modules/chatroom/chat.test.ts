import { expect } from "chai";
import { before, describe } from "mocha";
import { Application } from "../../app.js";
import { NotificationTester } from "../../test/NotificationTester.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe("chatting api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;

  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app.db);
    caseData = await baseCase(app.db);
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

  it("should be able to delete chatrooms", async () => {
    const in_chat = caseData.chat;
    const in_user = caseData.chat_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await deleteRoom(in_chat.id, cookie);
    expect(send_req.status).to.eq(200);

    const read_req = await getChatroomDetail(in_chat.id, cookie);
    expect(read_req.status).to.eq(404);
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

    const send_req = await sendMessage(in_chat.id, { message: in_message }, cookie);
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

    const send_req = await updateMessage(in_chat.id, in_message.id, { message: in_edited }, cookie);
    const send_result = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(send_result.id).to.eq(in_message.id);
    expect(send_result.message).to.eq(in_edited);
  });

  it("shouldn't allow users that disabled stranger messaging to be invited", async () => {
    const in_chat = caseData.chat;
    const in_user = caseData.chat_user;
    const in_disabled_user = caseData.pref_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await updateRoom(
      in_chat.id,
      { user_ids: [in_user.id, in_disabled_user.id] },
      cookie,
    );

    expect(send_req.status).to.eq(400);
  });

  it("should reject unauthorized viewers", async () => {
    const in_member = caseData.org_user;

    const cookie = await getLoginCookie(in_member.name, in_member.password);
    const read_req = await getChatroomMessages(caseData.chat.id, cookie);

    expect(read_req.status).to.eq(401);
  });

  it("should allow users to attach files", async () => {
    const in_data = {
      message: "test",
      files: [
        {
          filename: "def.txt",
          content: "data:text/plain;base64,abc",
        },
      ],
    };
    const in_user = caseData.chat_user;
    const in_room = caseData.chat;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await sendMessage(in_room.id, in_data, cookie);
    const result = await send_req.json();

    expect(send_req.status).to.eq(201);
    expect(result.files).to.containSubset(
      in_data.files.map((x) => ({
        filename: x.filename,
      })),
    );
  });

  it("should allow users to attach files to sent messages", async () => {
    const in_data = {
      files: [
        {
          filename: "abc.txt",
          content: "data:text/plain;base64,abc",
        },
      ],
    };

    const in_user = caseData.chat_user;
    const in_room = caseData.chat;
    const in_msg = caseData.message;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await updateMessage(in_room.id, in_msg.id, in_data, cookie);
    const result = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(result.files).to.containSubset(
      in_data.files.map((x) => ({
        filename: x.filename,
      })),
    );
  });

  describe("notifications", () => {
    it("should send notification on user message", async () => {
      const in_user = caseData.chat_user;
      const in_chat = caseData.chat;
      const in_message = "Hello testing!";

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const nt = NotificationTester.fromCookie(in_user.id, cookie);
      await nt.start();
      const send_req = await sendMessage(in_chat.id, { message: in_message }, cookie);
      await send_req.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).eq(1);
      expect(diff).containSubset([
        {
          type: "Diskusi Pribadi",
        },
      ]);
    });

    it("should send notification on project message", async () => {
      const in_user = caseData.project_admin_user;
      const in_chat = caseData.project_chat;
      const in_message = "Hello testing!";

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const nt = NotificationTester.fromCookie(in_user.id, cookie);
      await nt.start();
      const send_req = await sendMessage(in_chat.id, { message: in_message }, cookie);
      await send_req.json();
      await nt.finish();
      const diff = nt.diff();

      expect(diff.length).eq(1);
      expect(diff).containSubset([
        {
          type: "Diskusi Proyek",
        },
      ]);
    });
  });
});

// function getFileData(file_id: number, cookie: string) {
//   return new APIContext("FileDetailGet").fetch(`/api/files/${file_id}`, {
//     headers: {
//       cookie: cookie,
//     },
//     credentials: "include",
//     method: "get",
//   });
// }

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

function sendMessage(
  chatroom_id: number,
  data: {
    message: string;
    files?: {
      filename: string;
      content: string;
    }[];
  },
  cookie: string,
) {
  const { files, message } = data;
  return new APIContext("ChatroomsDetailMessagesPost").fetch(
    `/api/chatrooms/${chatroom_id}/messages`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "post",
      body: {
        files,
        message,
      },
    },
  );
}

function updateMessage(
  chatroom_id: number,
  message_id: number,
  data: {
    message?: string;
    files?: {
      filename: string;
      content: string;
    }[];
  },
  cookie: string,
) {
  const { files, message } = data;
  return new APIContext("ChatroomsDetailMessagesPut").fetch(
    `/api/chatrooms/${chatroom_id}/messages/${message_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "put",
      body: {
        message,
        files,
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

function deleteRoom(chatroom_id: number, cookie: string) {
  return new APIContext("ChatroomsDetailDelete").fetch(`/api/chatrooms/${chatroom_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "delete",
  });
}
