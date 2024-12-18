import { AuthError, NotFoundError } from "../../helpers/error";
import { TransactionManager } from "../../helpers/transaction/transaction.js";
import { UserService, envUserServiceFactory } from "../user/UserService.js";
import { ArticleRepository } from "./ArticleRepository";

export function articleServiceFactory(transaction_manager: TransactionManager) {
  const db = transaction_manager.getDB();
  const article_repo = new ArticleRepository(db);
  const user_service = envUserServiceFactory(transaction_manager);
  const article_service = new ArticleService(article_repo, user_service);
  return article_service;
}

export class ArticleService {
  private article_repo: ArticleRepository;
  private user_service: UserService;

  constructor(article_repo: ArticleRepository, user_service: UserService) {
    this.article_repo = article_repo;
    this.user_service = user_service;
  }

  async getArticles(filter?: { keyword?: string; page?: number; limit?: number }) {
    return await this.article_repo.getArticles(filter);
  }

  async countArticles(filter?: { keyword?: string }) {
    return await this.article_repo.countArticles(filter);
  }

  async getArticlesById(article_id: number) {
    return await this.article_repo.getArticlesById(article_id);
  }

  async addArticle(obj: {
    name: string;
    description: string;
    content: string;
    user_id: number;
    image?: string;
  }) {
    return await this.article_repo.addArticle(obj);
  }

  async updateArticle(
    article_id: number,
    obj: {
      name?: string;
      description?: string;
      content?: string;
      image?: string | null;
    },
    sender_id: number,
  ) {
    const article = await this.getArticlesById(article_id);

    if (article == undefined) {
      throw new NotFoundError("Gagal menemukan artikel tersebut!");
    }

    const is_admin = await this.user_service.isAdminUser(sender_id);

    if (article.user_id !== sender_id && !is_admin) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }

    return await this.article_repo.updateArticle(article_id, obj);
  }

  async deleteArticle(article_id: number, sender_id: number) {
    const article = await this.getArticlesById(article_id);
    if (article == undefined) {
      throw new NotFoundError("Gagal menemukan artikel tersebut!");
    }

    const is_admin = await this.user_service.isAdminUser(sender_id);

    if (article.user_id !== sender_id && !is_admin) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }

    return await this.article_repo.deleteArticle(article_id);
  }

  async likeArticle(article_id: number, user_id: number, sender_id: number) {
    if (sender_id !== user_id) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    await this.article_repo.likeArticle(article_id, user_id);
  }

  async unlikeArticle(article_id: number, user_id: number, sender_id: number) {
    if (sender_id !== user_id) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan aksi ini!");
    }
    return await this.article_repo.unlikeArticle(article_id, user_id);
  }

  async getArticleLikeStatus(article_id: number, user_id: number) {
    const result = await this.article_repo.getArticleLikeStatus(article_id, user_id);
    return {
      like: result.length != 0,
    };
  }

  async getArticleLikeCount(article_id: number) {
    return await this.article_repo.getArticleLikeCount(article_id);
  }

  async getArticlesComment(article_id: number) {
    return await this.article_repo.getArticlesComment(article_id);
  }

  async getCommentByID(comment_id: number) {
    return await this.article_repo.getCommentByID(comment_id);
  }

  async addComment(obj: { article_id: number; user_id: number; comment: string }) {
    return await this.article_repo.addComment(obj);
  }
  async deleteComment(comment_id: number, sender_id: number) {
    const comment = await this.article_repo.getCommentByID(comment_id);
    if (comment == undefined) {
      throw new NotFoundError("Gagal menemukan komentar!");
    }
    const is_admin = await this.user_service.isAdminUser(sender_id);
    if (comment.user_id !== sender_id && !is_admin) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
    }
    await this.article_repo.deleteComment(comment_id);
  }

  async updateComment(comment_id: number, obj: { comment: string }, sender_id: number) {
    const comment = await this.article_repo.getCommentByID(comment_id);
    if (comment == undefined) {
      throw new NotFoundError("Gagal menemukan komentar!");
    }
    const is_admin = await this.user_service.isAdminUser(sender_id);
    if (comment.user_id !== sender_id && !is_admin) {
      throw new AuthError("Anda tidak memiliki akses untuk melakukan hal ini!");
    }
    await this.article_repo.updateComment({ comment_id, comment: obj.comment });
  }
}
