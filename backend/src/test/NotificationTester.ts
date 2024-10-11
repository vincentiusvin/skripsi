import _ from "lodash";
import { APIContext, getLoginCookie } from "./helpers.js";

export function getNotifications(user_id: number, cookie: string) {
  return new APIContext("NotificationsGet").fetch(`/api/notifications`, {
    headers: {
      cookie: cookie,
    },
    query: {
      user_id: user_id.toString(),
    },
    credentials: "include",
    method: "get",
  });
}

export class NotificationTester {
  private cookie: string;
  private user_id: number;
  private before?: {
    created_at: Date;
    description: string;
    id: number;
    user_id: number;
    type: "OrgManage" | "ProjectManage" | "ProjectTask" | "ProjectChat" | "GeneralChat";
    read: boolean;
    title: string;
    type_id: number | null;
  }[];
  private after?: {
    created_at: Date;
    description: string;
    id: number;
    user_id: number;
    type: "OrgManage" | "ProjectManage" | "ProjectTask" | "ProjectChat" | "GeneralChat";
    read: boolean;
    title: string;
    type_id: number | null;
  }[];

  private constructor(user_id: number, cookie: string) {
    this.user_id = user_id;
    this.cookie = cookie;
  }

  static async fromLoginInfo(user_id: number, username: string, password: string) {
    const cookie = await getLoginCookie(username, password);
    return new NotificationTester(user_id, cookie);
  }

  static fromCookie(user_id: number, cookie: string) {
    return new NotificationTester(user_id, cookie);
  }

  getBefore() {
    if (this.before == undefined) {
      throw new Error("Notification tester not started! Please call start()");
    }
    return this.before;
  }

  getAfter() {
    if (this.after == undefined) {
      throw new Error("Notification tester not finished! Please call finish()");
    }
    return this.after;
  }

  diff() {
    const before = this.getBefore();
    const after = this.getAfter();
    return _.differenceWith(after, before, _.isEqual);
  }

  async start() {
    const req = await getNotifications(this.user_id, this.cookie);
    const result = await req.json();
    this.before = result;
  }

  async finish() {
    const req = await getNotifications(this.user_id, this.cookie);
    const result = await req.json();
    this.after = result;
  }
}
