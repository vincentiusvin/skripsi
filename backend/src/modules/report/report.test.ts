import { expect } from "chai";
import { Application } from "../../app.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";
import { ReportStatus } from "./ReportMisc.js";

describe.only("report api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("should be able to get reports as sender", async () => {
    const in_report = caseData.reports[0];
    const in_user = caseData.report_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getReports({ user_id: in_user.id }, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    const found = result.find((x) => x.id === in_report.id);
    expect(found).to.not.eq(undefined);
    expect(found?.title).to.eq(in_report.title);
  });

  it("should be able to get report detail as sender", async () => {
    const in_report = caseData.reports[0];
    const in_user = caseData.report_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getReportDetail({ report_id: in_report.id }, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    expect(result.title).to.eq(in_report.title);
  });

  it("shouldn't be able to get all reports as non admin", async () => {
    const in_user = caseData.report_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getReports({}, cookie);
    await read_req.json();

    expect(read_req.status).eq(401);
  });

  it("should be able to add new report", async () => {
    const in_user = caseData.plain_user;
    const in_report = {
      title: "test insert report",
      description: "desc",
      status: "Pending",
    } as const;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await postReports(in_report, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(201);
    expect(result).to.deep.include(in_report);
  });

  for (const { ok, user_key, statement, in_data } of [
    {
      user_key: "report_user",
      statement: "should be able to update regular report data as author",
      ok: true,
      in_data: {
        title: "new update title",
      },
    },
    {
      user_key: "plain_user",
      statement: "shouldn't be able to update regular report data as other user",
      ok: false,
      in_data: {
        title: "new update title",
      },
    },
    {
      user_key: "admin_user",
      statement: "should be able to update regular report data as other user",
      ok: true,
      in_data: {
        title: "new update title",
      },
    },
    {
      user_key: "admin_user",
      statement: "should be able to resolve report as admin",
      ok: true,
      in_data: {
        status: "Resolved",
        resolution: "abc",
      },
    },
    {
      user_key: "admin_user",
      statement: "shouldn't be able to resolve report without notes",
      ok: false,
      in_data: {
        status: "Resolved",
      },
    },
    {
      user_key: "report_user",
      statement: "shouldn't be able to resolve report as user",
      ok: false,
      in_data: {
        status: "Resolved",
        resolution: "abc",
      },
    },
  ] as const) {
    it(statement, async () => {
      const in_user = caseData[user_key];
      const in_report = caseData.reports[0];

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const read_req = await putReports(in_report.id, in_data, cookie);
      const result = await read_req.json();

      if (ok) {
        expect(read_req.status).eq(200);
        expect(result).to.deep.include(in_data);
      } else {
        expect(read_req.status).oneOf([401, 400]);
      }
    });
  }
});

function getReports(opts: { user_id?: number }, cookie: string) {
  return new APIContext("ReportsGet").fetch(`/api/reports/`, {
    headers: {
      cookie: cookie,
    },
    query: {
      user_id: opts.user_id?.toString(),
    },
    credentials: "include",
    method: "get",
  });
}

function getReportDetail(opts: { report_id?: number }, cookie: string) {
  return new APIContext("ReportsDetailGet").fetch(`/api/reports/${opts.report_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function postReports(
  opts: {
    title: string;
    description: string;
    status: ReportStatus;
    resolution?: string | undefined;
    resolved_at?: string | undefined;
    chatroom_id?: number | undefined;
  },
  cookie: string,
) {
  return new APIContext("ReportsPost").fetch(`/api/reports`, {
    headers: {
      cookie: cookie,
    },
    body: opts,
    credentials: "include",
    method: "post",
  });
}

function putReports(
  report_id: number,
  opts: {
    title?: string;
    description?: string;
    status?: ReportStatus;
    resolution?: string | undefined;
    resolved_at?: string | undefined;
    chatroom_id?: number | undefined;
  },
  cookie: string,
) {
  return new APIContext("ReportsDetailPut").fetch(`/api/reports/${report_id}`, {
    headers: {
      cookie: cookie,
    },
    body: opts,
    credentials: "include",
    method: "put",
  });
}
