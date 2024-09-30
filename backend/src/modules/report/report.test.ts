import { expect } from "chai";
import { Application } from "../../app.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

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

  it("should be able to get reports", async () => {
    const in_report = caseData.reports[0];
    const in_user = caseData.report_user;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getReports(cookie);
    const result = await read_req.json();

    const found = result.find((x) => x.id === in_report.id);
    expect(read_req.status).eq(200);
    expect(found).to.not.eq(undefined);
    expect(found?.title).to.eq(in_report.title);
  });
});

function getReports(cookie: string) {
  return new APIContext("ReportsGet").fetch(`/api/reports/`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}
