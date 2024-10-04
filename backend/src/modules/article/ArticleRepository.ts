import { Kysely } from "kysely";
import { DB } from "../../db/db_types";

export class ArticleRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getArticles() {
    const res = await this.db
      .selectFrom("ms_articles")
      .select([
        "ms_articles.id as article_id",
        "ms_articles.name as article_name",
        "ms_articles.description as article_description",
        "ms_articles.user_id",
      ])
      .execute();
    return res;
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
      .select((eb) => eb.fn.count("article_id").as("articles_count"))
      .where("ms_articles_likes.article_id", "=", articles_id)
      .executeTakeFirst();
  }

  async addArticle(obj: {
    articles_name: string;
    articles_description: string;
    articles_content: string;
    articles_user_id: number;
  }) {
    const { articles_name, articles_description, articles_content, articles_user_id } = obj;
    return await this.db.transaction().execute(async (trx) => {
      const article = await trx
        .insertInto("ms_articles")
        .values({
          name: articles_name,
          description: articles_description,
          content: articles_content,
          user_id: articles_user_id,
        })
        .returning(["ms_articles.id"])
        .executeTakeFirst();
      if (!article) {
        throw new Error("Data not inserted");
      }
      return article;
    });
  }

  async updateArticle(
    article_id: number,
    obj: {
      articles_name: string;
      articles_description: string;
      articles_content: string;
    },
  ) {
    const { articles_name, articles_description, articles_content } = obj;
    return await this.db.transaction().execute(async (trx) => {
      if (
        articles_name != undefined ||
        articles_description != undefined ||
        articles_content != undefined
      ) {
        await trx
          .updateTable("ms_articles")
          .set({
            name: articles_name,
            description: articles_description,
            content: articles_content,
          })
          .where("ms_articles.id", "=", article_id)
          .executeTakeFirst();
      }
    });
  }

  async deleteArticle(article_id: number) {
    return await this.db
      .deleteFrom("ms_articles")
      .where("ms_articles.id", "=", article_id)
      .execute();
  }

  async upvotesPost(obj: { article_id: number; user_id: number }) {
    const { article_id, user_id } = obj;
    return await this.db.transaction().execute(async (trx) => {
      let upvotes;
      if (article_id != undefined || user_id != undefined) {
        upvotes = await trx
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
    });
  }

  async upvotesDelete(article_id: number, user_id: number) {
    return await this.db
      .deleteFrom("ms_articles_likes")
      .where("article_id", "=", article_id)
      .where("user_id", "=", user_id)
      .execute();
  }
}
