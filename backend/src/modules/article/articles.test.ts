import { expect } from "chai";
import { before, beforeEach, describe } from "mocha";
import { Application } from "../../app.js";
import { baseCase } from "../../test/fixture_data.js";
import { APIContext, getLoginCookie } from "../../test/helpers.js";
import { clearDB } from "../../test/setup-test.js";

describe.only("articles api", () => {
  let app: Application;
  let caseData: Awaited<ReturnType<typeof baseCase>>;
  before(async () => {
    app = Application.getApplication();
  });

  beforeEach(async () => {
    await clearDB(app);
    caseData = await baseCase(app.db);
  });

  it("should be able to get articles", async () => {
    const cookie = await getLoginCookie(caseData.plain_user.name, caseData.plain_user.password);
    const expected_article = caseData.articles[0];

    const read_req = await getArticles(cookie);
    const result = await read_req.json();

    const found_org = result.find((x) => x.article_id === expected_article.id);
    expect(read_req.status).eq(200);
    expect(found_org).to.not.eq(undefined);
    expect(found_org?.article_name).to.eq(expected_article.name);
  });
});

function getArticles(cookie: string) {
  return new APIContext("ArticlesGet").fetch(`/api/articles`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}
