import _ from "lodash";
import { APIContext, getLoginCookie } from "./helpers.js";

export function getProjectEvents(project_id: number, cookie: string) {
  return new APIContext("ProjectsDetailEventsGet").fetch(`/api/projects/${project_id}/events`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

export class ProjectEventTester {
  private cookie: string;
  private project_id: number;
  private before?: {
    created_at: Date;
    id: number;
    project_id: number;
    event: string;
  }[];
  private after?: {
    created_at: Date;
    id: number;
    project_id: number;
    event: string;
  }[];

  private constructor(user_id: number, cookie: string) {
    this.project_id = user_id;
    this.cookie = cookie;
  }

  static async fromLoginInfo(user_id: number, username: string, password: string) {
    const cookie = await getLoginCookie(username, password);
    return new ProjectEventTester(user_id, cookie);
  }

  static fromCookie(user_id: number, cookie: string) {
    return new ProjectEventTester(user_id, cookie);
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
    const req = await getProjectEvents(this.project_id, this.cookie);
    const result = await req.json();
    this.before = result;
  }

  async finish() {
    const req = await getProjectEvents(this.project_id, this.cookie);
    const result = await req.json();
    this.after = result;
  }
}
