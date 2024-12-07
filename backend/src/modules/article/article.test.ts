import { expect } from "chai";
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
    await clearDB(app.db);
    caseData = await baseCase(app.db);
  });

  it("should be able to get articles", async () => {
    const in_user = caseData.plain_user;
    const in_article = caseData.article;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await getArticles(cookie);
    const { result } = await send_req.json();

    const found = result.find((x) => x.id === in_article.id);
    expect(send_req.status).to.eq(200);
    expect(found).to.not.eq(undefined);
    expect(found).to.containSubset(in_article);
  });

  it("should be able to get article detail", async () => {
    const in_user = caseData.plain_user;
    const in_article = caseData.article;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await getArticleDetail(in_article.id, cookie);
    const result = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(result).to.containSubset(in_article);
  });

  it("should be able to add article", async () => {
    const in_user = caseData.plain_user;
    const in_article = {
      name: "New article name ",
      description: "New description for new article",
      content: "New content ",
      image: "New image",
    };

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addArticle(in_article, cookie);
    const result = await send_req.json();

    expect(send_req.status).to.eq(201);
    expect(result).to.containSubset(in_article);
  });

  const update_cases = [
    {
      title: "shouldn't be able to update article as other people",
      user_key: "plain_user",
      ok: false,
    },
    {
      title: "should be able to update article as author",
      user_key: "article_user",
      ok: true,
    },
    {
      title: "should be able to update article as author",
      user_key: "admin_user",
      ok: true,
    },
  ] as const;

  for (const { title, user_key, ok } of update_cases) {
    it(title, async () => {
      const in_user = caseData[user_key];
      const in_article = caseData.article;
      const in_update = {
        name: "New name from update",
        description: "New description after updating",
        content: "New content from update",
        image: "New image",
      };

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const send_req = await updateArticle(in_article.id, in_update, cookie);
      const result = await send_req.json();

      if (ok) {
        expect(send_req.status).to.eq(200);
        expect(result).to.containSubset(in_update);
      } else {
        expect(send_req.status).to.not.eq(200);
      }
    });
  }

  const delete_cases = [
    {
      title: "shouldn't be able to delete article as other people",
      user_key: "plain_user",
      ok: false,
    },
    {
      title: "should be able to delete article as author",
      user_key: "article_user",
      ok: true,
    },
    {
      title: "should be able to delete article as admin",
      user_key: "admin_user",
      ok: true,
    },
  ] as const;

  for (const { title, user_key, ok } of delete_cases) {
    it(title, async () => {
      const in_user = caseData[user_key];
      const in_article = caseData.article;

      const cookie = await getLoginCookie(in_user.name, in_user.password);
      const send_req = await deleteArticle(in_article.id, cookie);
      await send_req.json();

      if (ok) {
        expect(send_req.status).to.eq(200);
      } else {
        expect(send_req.status).to.not.eq(200);
      }
    });
  }

  it("should be able to like article", async () => {
    const in_user = caseData.plain_user;
    const in_article = caseData.article;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await likeArticle(in_article.id, in_user.id, cookie);
    const result = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(result.like).to.eq(true);
  });

  it("should be able to get article like status", async () => {
    const in_user = caseData.article_liker;
    const in_article = caseData.article;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const read_req = await getArticleLikeStatus(in_article.id, in_user.id, cookie);
    const result = await read_req.json();

    expect(read_req.status).to.eq(200);
    expect(result.like).to.eq(true);
  });

  it("should be able to unlike liked article", async () => {
    const in_user = caseData.article_liker;
    const in_article = caseData.article;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await unlikeArticle(in_article.id, in_user.id, cookie);
    await send_req.json();

    const read_req = await getArticleLikeStatus(in_article.id, in_user.id, cookie);
    const result = await read_req.json();

    expect(send_req.status).to.eq(200);
    expect(result.like).to.eq(false);
  });

  it("should be able to count article likes", async () => {
    const in_user = caseData.plain_user;
    const in_article = caseData.article;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await getArticleLikes(in_article.id, cookie);
    const result = await send_req.json();

    expect(send_req.status).to.eq(200);
    expect(result.likes).to.eq(1);
  });

  it("should be able to comment on articles", async () => {
    const in_user = caseData.plain_user;
    const in_article = caseData.article;
    const in_comment = "Very cool article. Very informative!";

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await addComment(in_article.id, in_comment, cookie);
    const result = await send_req.json();

    const expected_data = {
      comment: in_comment,
      article_id: in_article.id,
      user_id: in_user.id,
    };

    expect(send_req.status).to.eq(201);
    expect(result).to.containSubset(expected_data);
  });

  it("should be able to read comments on articles", async () => {
    const in_user = caseData.plain_user;
    const in_article = caseData.article;

    const cookie = await getLoginCookie(in_user.name, in_user.password);
    const send_req = await getComments(in_article.id, cookie);
    await send_req.json();

    expect(send_req.status).to.eq(200);
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

function getArticleDetail(article_id: number, cookie: string) {
  return new APIContext("ArticlesDetailGet").fetch(`/api/articles/${article_id}`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function updateArticle(
  article_id: number,
  body: {
    name?: string | undefined;
    description?: string | undefined;
    content?: string | undefined;
    image?: string | null | undefined;
  },
  cookie: string,
) {
  return new APIContext("ArticlesDetailPut").fetch(`/api/articles/${article_id}`, {
    headers: {
      cookie: cookie,
    },
    body: body,
    credentials: "include",
    method: "put",
  });
}

function addArticle(
  body: {
    name: string;
    description: string;
    content: string;
    image: string | undefined;
  },
  cookie: string,
) {
  return new APIContext("ArticlesPost").fetch(`/api/articles`, {
    headers: {
      cookie: cookie,
    },
    body: body,
    credentials: "include",
    method: "post",
  });
}

function deleteArticle(article_id: number, cookie: string) {
  return new APIContext("ArticlesDetailDelete").fetch(`/api/articles/${article_id} `, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "delete",
  });
}

function likeArticle(article_id: number, user_id: number, cookie: string) {
  return new APIContext("ArticlesDetailLikesDetailPut").fetch(
    `/api/articles/${article_id}/likes/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      body: {
        like: true,
      },
      method: "put",
    },
  );
}

function unlikeArticle(article_id: number, user_id: number, cookie: string) {
  return new APIContext("ArticlesDetailLikesDetailDelete").fetch(
    `/api/articles/${article_id}/likes/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "delete",
    },
  );
}

function getArticleLikeStatus(article_id: number, user_id: number, cookie: string) {
  return new APIContext("ArticlesDetailLikesDetailGet").fetch(
    `/api/articles/${article_id}/likes/${user_id}`,
    {
      headers: {
        cookie: cookie,
      },
      credentials: "include",
      method: "get",
    },
  );
}

function getArticleLikes(article_id: number, cookie: string) {
  return new APIContext("ArticlesDetailLikesGet").fetch(`/api/articles/${article_id}/likes`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}

function addComment(article_id: number, comment: string, cookie: string) {
  return new APIContext("ArticlesDetailCommentsPost").fetch(
    `/api/articles/${article_id}/comments`,
    {
      headers: {
        cookie: cookie,
      },
      body: {
        comment,
      },
      credentials: "include",
      method: "post",
    },
  );
}

function getComments(article_id: number, cookie: string) {
  return new APIContext("ArticlesDetailCommentsGet").fetch(`/api/articles/${article_id}/comments`, {
    headers: {
      cookie: cookie,
    },
    credentials: "include",
    method: "get",
  });
}
