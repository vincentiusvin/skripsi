import { Kysely, sql } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
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
      ])
      .execute();
    return res;
  }

  async getArticlesById(articles_id: number) {
    return await this.db
      .selectFrom("ms_articles")
      .select((eb) => [
        "ms_articles.name as articles_name",
        "ms_articles.content as articles_content",
        "ms_articles.id as id",
        jsonArrayFrom(
          eb
            .selectFrom("ms_comments")
            .select(["ms_comments.comment", "ms_comments.user_id"])
            .whereRef("ms_comments.article_id", "=", "ms_articles.id"),
        ).as("articles_comments"),
      ])
      .where("ms_articles.id", "=", articles_id)
      .executeTakeFirst();
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
}
