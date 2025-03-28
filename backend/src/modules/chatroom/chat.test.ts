import { expect } from "chai";
import { readFileSync } from "fs";
import { before, describe } from "mocha";
import path from "path";
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
    const send_req = await addChatroom(
      {
        user_ids: [in_user.id],
        chatroom_name: in_chatroom_name,
      },
      cookie,
    );
    expect(send_req.status).to.eq(201);

    const read_req = await getChatrooms(
      {
        user_id: in_user.id,
      },
      cookie,
    );
    const result = await read_req.json();
    const found = result.find((x) => x.chatroom_name === in_chatroom_name);
    expect(found).to.not.eq(undefined);
  });

  it("should be able to add and get project chat", async () => {
    const in_user = caseData.dev_user;
    const in_project = caseData.project;
    const in_chatroom_name = "project's chatroom";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addChatroom(
      {
        project_id: in_project.id,
        chatroom_name: in_chatroom_name,
      },
      cookie,
    );
    expect(send_req.status).eq(201);

    const read_req = await getChatrooms(
      {
        project_id: in_project.id,
      },
      cookie,
    );
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

    const read_req = await getChatroomMessages(
      {
        chatroom_id: in_chat.id,
      },
      cookie,
    );

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

  const invite_cases = [
    {
      msg: "should allow users to be invited",
      user_key: "plain_user",
      sender_key: "chat_user",
      ok: true,
    },
    {
      msg: "shouldn't allow users that disabled stranger messaging to be invited",
      user_key: "pref_user",
      sender_key: "chat_user",
      ok: false,
    },
    {
      msg: "shouldn't allow uninvolved users to add chatroom users",
      user_key: "plain_user",
      sender_key: "article_user",
      ok: false,
    },
  ] as const;

  for (const { ok, msg, user_key, sender_key } of invite_cases) {
    it(msg, async () => {
      const in_chat = caseData.chat;
      const in_user = caseData[sender_key];
      const in_disabled_user = caseData[user_key];

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const send_req = await addMember(in_chat.id, in_disabled_user.id, cookie);

      if (ok) {
        expect(send_req.status).to.eq(200);
      } else {
        expect(send_req.status).oneOf([400, 401]);
      }
    });
  }

  const remove_cases = [
    {
      msg: "should allow users to be removed",
      user_key: "chat_user_2",
      sender_key: "chat_user",
      ok: true,
    },
    {
      msg: "shouldn't allow uninvolved users to remove chatroom users",
      user_key: "plain_user",
      sender_key: "article_user",
      ok: false,
    },
  ] as const;

  for (const { ok, msg, user_key, sender_key } of remove_cases) {
    it(msg, async () => {
      const in_chat = caseData.chat;
      const in_user = caseData[sender_key];
      const in_disabled_user = caseData[user_key];

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const send_req = await deleteMember(in_chat.id, in_disabled_user.id, cookie);

      if (ok) {
        expect(send_req.status).to.eq(200);
      } else {
        expect(send_req.status).oneOf([400, 401]);
      }
    });
  }

  it("should reject unauthorized viewers", async () => {
    const in_member = caseData.org_user;
    const in_chat = caseData.chat;

    const cookie = await getLoginCookie(in_member.name, in_member.password);
    const read_req = await getChatroomMessages(
      {
        chatroom_id: in_chat.id,
      },
      cookie,
    );

    expect(read_req.status).to.eq(401);
  });

  it("should allow users to attach files", async () => {
    const in_img = getImage();
    const in_data = {
      message: "test",
      files: [
        {
          filename: in_img.filename,
          content: in_img.mimeprefix + in_img.content,
        },
      ],
    };
    const in_user = caseData.chat_user;
    const in_room = caseData.chat;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await sendMessage(in_room.id, in_data, cookie);
    const result = await send_req.json();
    const file = result.files[0];
    const file_req = await getFileData(file.id, cookie);
    const file_result = await file_req.blob();
    const file_buffer = await file_result.arrayBuffer();
    const stored_file = Buffer.from(file_buffer).toString("base64");

    expect(send_req.status).to.eq(201);
    expect(file).to.containSubset({
      filename: in_img.filename,
      filetype: in_img.mimetype,
    });
    expect(stored_file).to.eq(in_img.content);
  });

  it("should allow users to attach files to sent messages", async () => {
    const in_img = getImage();
    const in_data = {
      files: [
        {
          filename: in_img.filename,
          content: in_img.mimeprefix + in_img.content,
        },
      ],
    };

    const in_user = caseData.chat_user;
    const in_room = caseData.chat;
    const in_msg = caseData.message;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await updateMessage(in_room.id, in_msg.id, in_data, cookie);
    const result = await send_req.json();
    const file = result.files[0];
    const file_req = await getFileData(file.id, cookie);
    const file_result = await file_req.blob();
    const file_buffer = await file_result.arrayBuffer();
    const stored_file = Buffer.from(file_buffer).toString("base64");

    expect(send_req.status).to.eq(200);
    expect(file).to.containSubset({
      filename: in_img.filename,
      filetype: in_img.mimetype,
    });
    expect(stored_file).to.eq(in_img.content);
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

function getFileData(file_id: number, cookie: string) {
  return new APIContext("FileDetailGet").fetch(`/api/files/${file_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function addChatroom(
  opts: {
    project_id?: number;
    user_ids?: number[];
    chatroom_name: string;
  },
  cookie: string,
) {
  return new APIContext("ChatroomsPost").fetch(`/api/chatrooms`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "post",
    body: opts,
  });
}

function getChatrooms(opts: { project_id?: number; user_id?: number }, cookie: string) {
  const { project_id, user_id } = opts;
  return new APIContext("ChatroomsGet").fetch(`/api/chatrooms`, {
    headers: {
      cookie: cookie,
    },
    query: {
      project_id: project_id?.toString(),
      user_id: user_id?.toString(),
    },
    credentials: "include",
    method: "get",
  });
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

function getChatroomMessages(
  opts: {
    chatroom_id: number;
    limit?: number;
    before_message_id?: number;
  },
  cookie: string,
) {
  const { chatroom_id, limit, before_message_id } = opts;
  return new APIContext("ChatroomsDetailMessagesGet").fetch(
    `/api/chatrooms/${chatroom_id}/messages`,
    {
      headers: {
        cookie: cookie,
      },
      query: {
        before_message_id: before_message_id?.toString(),
        limit: limit?.toString(),
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

function updateRoom(chatroom_id: number, opts: { name?: string }, cookie: string) {
  return new APIContext("ChatroomsDetailPut").fetch(`/api/chatrooms/${chatroom_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "put",
    body: {
      name: opts.name,
    },
  });
}

function addMember(chatroom_id: number, user_id: number, cookie: string) {
  return new APIContext("ChatroomsDetailUsersDetailPut").fetch(
    `/api/chatrooms/${chatroom_id}/users/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "put",
      body: {
        role: "Member",
      },
    },
  );
}

function deleteMember(chatroom_id: number, user_id: number, cookie: string) {
  return new APIContext("ChatroomsDetailUsersDetailDelete").fetch(
    `/api/chatrooms/${chatroom_id}/users/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "delete",
    },
  );
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

let image:
  | {
      mimeprefix: string;
      mimetype: string;
      content: string;
      filename: string;
    }
  | undefined = undefined;
function getImage() {
  if (image == undefined) {
    const filepath = path.resolve(__dirname, "./test_img.jpg");
    image = {
      mimeprefix: "data:image/jpeg;base64,",
      mimetype: "image/jpeg",
      content: readFileSync(filepath, "base64"),
      filename: "test_img.jpg",
    };
  }
  return image;
}
