import { AuthError } from "../../helpers/error";
import { TransactionManager } from "../../helpers/service.js";
import { ArticleRepository } from "./ArticleRepository";

export function articleServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.db;
  const article_repo = new ArticleRepository(db);
  const article_service = new ArticleService(article_repo);
  return article_service;
}

export class ArticleService {
  private article_repo: ArticleRepository;
  constructor(article_repo: ArticleRepository) {
    this.article_repo = article_repo;
  }

  getArticles() {
    return this.article_repo.getArticles();
  }

  getArticlesById(article_id: number) {
    return this.article_repo.getArticlesById(article_id);
  }

  getArticlesComment(article_id: number) {
    return this.article_repo.getArticlesComment(article_id);
  }

  getArticlesByLikes(article_id: number) {
    return this.article_repo.getArticleLikesById(article_id);
  }

  getArticleCount(article_id: number) {
    return this.article_repo.getArticleLikesCount(article_id);
  }

  async addArticle(obj: {
    articles_name: string;
    articles_description: string;
    articles_content: string;
    articles_user_id: number;
  }) {
    return await this.article_repo.addArticle(obj);
  }

  async updateArticle(
    article_id: number,
    obj: {
      articles_name: string;
      articles_description: string;
      articles_content: string;
    },
    editor_user: number,
  ) {
    const editor_id = await this.getArticlesById(article_id);
    if (editor_id?.user_id !== editor_user) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return await this.article_repo.updateArticle(article_id, obj);
  }

  async deleteArticle(article_id: number) {
    return await this.article_repo.deleteArticle(article_id);
  }

  async upvotesPost(obj: { article_id: number; user_id: number }) {
    return await this.article_repo.upvotesPost(obj);
  }

  async upvotesDelete(article_id: number, user_id: number) {
    return await this.article_repo.upvotesDelete(article_id, user_id);
  }
}
