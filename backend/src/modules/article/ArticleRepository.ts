import { Kysely, SelectQueryBuilder, sql } from "kysely";
import { DB } from "../../db/db_types";
import { paginateQuery } from "../../helpers/pagination";

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
    let res = this.db
      .selectFrom("ms_articles")
      .select([
        "ms_articles.id as article_id",
        "ms_articles.name as article_name",
        "ms_articles.description as article_description",
        "ms_articles.user_id",
        "ms_articles.image as article_image",
      ]);
    res = this.applyFilterToQuery(res, { keyword });

    res = paginateQuery(res, {
      page,
      limit,
    });

    return res.execute();
  }

  async getArticlesById(articles_id: number) {
    return await this.db
      .selectFrom("ms_articles")
      .select([
        "ms_articles.name as articles_name",
        "ms_articles.content as articles_content",
        "ms_articles.id as id",
        "ms_articles.description as articles_description",
        "ms_articles.user_id",
        "ms_articles.image as articles_image",
      ])
      .where("ms_articles.id", "=", articles_id)
      .executeTakeFirst();
  }

  async getArticlesComment(articles_id: number) {
    return await this.db
      .selectFrom("ms_comments")
      .select(["ms_comments.comment", "ms_comments.user_id"])
      .where("ms_comments.article_id", "=", articles_id)
      .execute();
  }

  async getArticleLikesById(articles_id: number) {
    return await this.db
      .selectFrom("ms_articles_likes")
      .select("ms_articles_likes.user_id as user_id")
      .where("ms_articles_likes.article_id", "=", articles_id)
      .execute();
  }

  async getArticleLikesCount(articles_id: number) {
    return await this.db
      .selectFrom("ms_articles_likes")
      .select(sql`COUNT(*)`.as(`articles_count`))
      .where("ms_articles_likes.article_id", "=", articles_id)
      .executeTakeFirst();
  }

  async addArticleLike(obj: { article_id: number; user_id: number }) {
    const { article_id, user_id } = obj;

    // Check if the user already liked the article
    const existingLike = await this.db
      .selectFrom("ms_articles_likes")
      .select("user_id")
      .where("article_id", "=", article_id)
      .where("user_id", "=", user_id)
      .executeTakeFirst();

    if (existingLike !== undefined) {
      throw new Error("User has already liked this article");
    }

    // Insert the like into the database
    const newLike = await this.db
      .insertInto("ms_articles_likes")
      .values({
        article_id: article_id,
        user_id: user_id,
      })
      .returning(["article_id", "user_id"])
      .executeTakeFirst();

    if (!newLike) {
      throw new Error("Failed to like the article");
    }

    return newLike;
  }

  async addComment(obj: { article_id: number; user_id: number; comment: string }) {
    const { article_id, user_id, comment } = obj;

    const newComment = await this.db
      .insertInto("ms_comments")
      .values({
        article_id: article_id, // Link to the article
        user_id: user_id, // The user who posted the comment
        comment: comment, // The comment content
      })
      .returning([
        "ms_comments.comment_id",
        "ms_comments.article_id",
        "ms_comments.user_id",
        "ms_comments.comment",
      ])
      .executeTakeFirst(); // Fetch the first (and only) inserted comment

    if (!newComment) {
      throw new Error("Data not inserted");
    }

    return newComment; // Return the inserted comment details
  }

  async addArticle(obj: {
    articles_name: string;
    articles_description: string;
    articles_content: string;
    articles_user_id: number;
    articles_image?: string | null;
  }) {
    const {
      articles_name,
      articles_description,
      articles_content,
      articles_user_id,
      articles_image,
    } = obj;
    const article = await this.db
      .insertInto("ms_articles")
      .values({
        name: articles_name,
        description: articles_description,
        content: articles_content,
        user_id: articles_user_id,
        image: articles_image,
      })
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
      articles_name?: string;
      articles_description?: string;
      articles_content?: string;
      articles_image?: string | null;
    },
  ) {
    const { articles_name, articles_description, articles_content, articles_image } = obj;
    if (
      articles_name != undefined ||
      articles_description != undefined ||
      articles_content != undefined
    ) {
      await this.db
        .updateTable("ms_articles")
        .set({
          name: articles_name,
          description: articles_description,
          content: articles_content,
          image: articles_image,
        })
        .where("ms_articles.id", "=", article_id)
        .executeTakeFirst();
    }
  }

  async deleteArticle(article_id: number) {
    return await this.db
      .deleteFrom("ms_articles")
      .where("ms_articles.id", "=", article_id)
      .execute();
  }

  async upvotesPost(obj: { article_id: number; user_id: number }) {
    const { article_id, user_id } = obj;
    let upvotes;
    if (article_id != undefined || user_id != undefined) {
      upvotes = await this.db
        .insertInto("ms_articles_likes")
        .values({
          article_id: article_id,
          user_id: user_id,
        })
        .returning(["ms_articles_likes.article_id", "ms_articles_likes.user_id"])
        .execute();
      if (!upvotes) {
        throw new Error("upvote failed");
      }
    }
    return upvotes;
  }

  async upvotesDelete(article_id: number, user_id: number) {
    return await this.db
      .deleteFrom("ms_articles_likes")
      .where("article_id", "=", article_id)
      .where("user_id", "=", user_id)
      .execute();
  }
}
