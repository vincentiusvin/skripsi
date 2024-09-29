import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
import { RH } from "../../helpers/types";
import { ArticleService } from "./ArticleService";

export class ArticleController extends Controller {
  private article_service: ArticleService;
  constructor(express_server: Express, article_service: ArticleService) {
    super(express_server);
    this.article_service = article_service;
  }

  init() {
    return {
      articleGet: new Route({
        handler: this.articleGet,
        method: "get",
        path: "/api/articles",
      }),
      articleGetId: new Route({
        handler: this.articleGetById,
        method: "get",
        path: "/api/articles/:id",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID artikel tidak boleh kosong!" }),
          }),
        },
      }),
      articleGetComment: new Route({
        handler: this.articleGetComment,
        method: "get",
        path: "/api/articles/:id/comments",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID artikel tidak boleh kosong!" }),
          }),
        },
      }),
      articleGetLikesId: new Route({
        handler: this.articleGetLikesById,
        method: "get",
        path: "/api/articles/:id/upvotes",
        schema: {
          Params: z.object({
            id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID artikel tidak boleh kosong!" }),
          }),
          ReqQuery: z.object({
            count: z.string().optional(),
          }),
        },
      }),
    };
  }

  private articleGet: RH<{
    ResBody: {
      article_name: string;
      article_description: string;
      article_id: number;
    }[];
  }> = async (req, res) => {
    const result = await this.article_service.getArticles();
    res.status(200).json(result);
  };
  private articleGetById: RH<{
    params: { id: string };
    ResBody: {
      articles_name: string;
      articles_content: string;
      id: number;
      articles_description: string;
    };
  }> = async (req, res) => {
    const id = Number(req.params.id);
    const result = await this.article_service.getArticlesById(id);
    res.status(200).json(result);
  };
  private articleGetComment: RH<{
    Params: { id: string };
    ResBody: {
      comment: string;
      user_id: number;
    }[];
  }> = async (req, res) => {
    const id = Number(req.params.id);
    const result = await this.article_service.getArticlesComment(id);
    res.status(200).json(result);
  };
  private articleGetLikesById: RH<{
    Params: { id: string };
    Query: { count?: string };
    ResBody:
      | {
          user_id: number;
        }[]
      | { articles_count: unknown };
  }> = async (req, res) => {
    const id = Number(req.params.id);
    const count = req.query.count === "True";
    let result;
    if (count) {
      result = await this.article_service.getArticleCount(id);
    } else {
      result = await this.article_service.getArticlesByLikes(id);
    }
    res.status(200).json(result);
  };
}
