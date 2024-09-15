import { expect } from "chai";
import { before, beforeEach, describe, it } from "mocha";
import { Application } from "../../app.js";
import { APIContext, baseCase, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("contribution api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app);
  });
  it("should get all contributions", async () => {
    const in_from = caseData.plain_user;
    const expected_contribution = caseData.contributions[0];

    const cookie = await getLoginCookie(in_from.name, in_from.password);
    const read_req = await getAllContributions({}, cookie);
    const result = await read_req.json();

    expect(read_req.status).eq(200);
    const found = result.find((x) => x.id === expected_contribution.id);
    expect(found).to.not.eq(undefined);
    expect(found?.contributions_name).to.eq(expected_contribution.name);
  });
});

function getAllContributions(params: { user_id?: number; project_id?: number }, cookie: string) {
  return new APIContext("ContributionsGet").fetch(`/api/contributions`, {
    headers: {
      cookie: cookie,
    },
    query: { user_id: params.user_id?.toString(), project_id: params.project_id?.toString() },
    credentials: "include",
    method: "get",
  });
}
