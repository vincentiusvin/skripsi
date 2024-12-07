import { Kysely, SelectQueryBuilder } from "kysely";
import { DB } from "../../db/db_types";
import { paginateQuery } from "../../helpers/pagination";

const defaultArticleFields = [
  "ms_articles.id as id",
  "ms_articles.name as name",
  "ms_articles.description as description",
  "ms_articles.user_id",
  "ms_articles.image as image",
  "ms_articles.content as content",
] as const;

const defaultCommentFields = [
  "ms_comments.id",
  "ms_comments.user_id",
  "ms_comments.article_id",
  "ms_comments.comment",
  "ms_comments.created_at",
] as const;

export class ArticleRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  applyFilterToQuery<O>(
    query: SelectQueryBuilder<DB, "ms_articles", O>,
    filter?: { keyword?: string; user_id?: number },
  ) {
    const { keyword } = filter || {};

    if (keyword != undefined && keyword.length !== 0) {
      query = query.where("ms_articles.name", "ilike", `%${keyword}%`);
    }

    return query;
  }

  async countArticles(filter?: { keyword?: string }) {
    const { keyword } = filter || {};
    let query = this.db.selectFrom("ms_articles").select((eb) => eb.fn.countAll().as("count"));
    query = this.applyFilterToQuery(query, { keyword });
    return await query.executeTakeFirstOrThrow();
  }

  getArticles(filter?: { keyword?: string; page?: number; limit?: number }) {
    const { keyword, page, limit } = filter ?? {};
    let query = this.db.selectFrom("ms_articles").select(defaultArticleFields);

    query = this.applyFilterToQuery(query, { keyword });

    query = paginateQuery(query, {
      page,
      limit,
    });

    return query.execute();
  }

  async getArticlesById(articles_id: number) {
    return await this.db
      .selectFrom("ms_articles")
      .select(defaultArticleFields)
      .where("ms_articles.id", "=", articles_id)
      .executeTakeFirst();
  }

  async addArticle(obj: {
    name: string;
    description: string;
    content: string;
    user_id: number;
    image?: string | null;
  }) {
    const article = await this.db
      .insertInto("ms_articles")
      .values(obj)
      .returning(["ms_articles.id"])
      .executeTakeFirst();

    if (!article) {
      throw new Error("Data not inserted");
    }

    return article;
  }

  async updateArticle(
    article_id: number,
    obj: {
      name?: string;
      description?: string;
      content?: string;
      image?: string | null;
    },
  ) {
    const can_run_update = Object.values(obj).some((x) => x !== undefined);

    if (!can_run_update) {
      return;
    }

    await this.db
      .updateTable("ms_articles")
      .set(obj)
      .where("ms_articles.id", "=", article_id)
      .executeTakeFirst();
  }

  async deleteArticle(article_id: number) {
    return await this.db
      .deleteFrom("ms_articles")
      .where("ms_articles.id", "=", article_id)
      .execute();
  }

  async getArticleLikeStatus(article_id: number, user_id: number) {
    return await this.db
      .selectFrom("ms_articles_likes")
      .select(["article_id", "user_id"])
      .where("ms_articles_likes.article_id", "=", article_id)
      .where("ms_articles_likes.user_id", "=", user_id)
      .execute();
  }

  async getArticleLikeCount(articles_id: number) {
    return await this.db
      .selectFrom("ms_articles_likes")
      .select((eb) => eb.fn.countAll().as("likes"))
      .where("ms_articles_likes.article_id", "=", articles_id)
      .executeTakeFirst();
  }

  async likeArticle(article_id: number, user_id: number) {
    return await this.db
      .insertInto("ms_articles_likes")
      .values({
        article_id,
        user_id,
      })
      .execute();
  }

  async unlikeArticle(article_id: number, user_id: number) {
    return await this.db
      .deleteFrom("ms_articles_likes")
      .where("article_id", "=", article_id)
      .where("user_id", "=", user_id)
      .execute();
  }

  async getArticlesComment(articles_id: number) {
    return await this.db
      .selectFrom("ms_comments")
      .select(defaultCommentFields)
      .where("ms_comments.article_id", "=", articles_id)
      .execute();
  }

  async getCommentByID(comment_id: number) {
    return await this.db
      .selectFrom("ms_comments")
      .select(defaultCommentFields)
      .where("ms_comments.id", "=", comment_id)
      .executeTakeFirst();
  }

  async addComment(obj: { article_id: number; user_id: number; comment: string }) {
    const { article_id, user_id, comment } = obj;

    const res = await this.db
      .insertInto("ms_comments")
      .values({
        article_id,
        user_id,
        comment,
      })
      .returning("id")
      .executeTakeFirst();
    if (res == undefined) {
      throw new Error("Gagal memasukkan komentar!");
    }
    return res;
  }
}
