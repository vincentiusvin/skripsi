import { ArticleRepository } from "./ArticleRepository";

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

  getArticlesByLikes(article_id: number) {
    return this.article_repo.getArticleLikesById(article_id);
  }

  getArticleCount(article_id: number) {
    return this.article_repo.getArticleLikesCount(article_id);
  }
}
