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
      articleAdd: new Route({
        handler: this.articleAdd,
        method: "post",
        path: "/api/articles",
        schema: {
          ReqBody: z.object({
            articles_name: z.string().min(1, "Nama artikel tidak boleh kosong!"),
            articles_description: z.string().min(1, "Deskripsi artikel tidak boleh kosong"),
            articles_content: z.string().min(1, "Content artikel tidak boleh kosong!"),
            articles_user_id: z.number().min(1, "user_id invalid!"),
          }),
        },
      }),
      articlePut: new Route({
        handler: this.articleUpdate,
        method: "put",
        path: "/api/articles/:id",
        schema: {
          Params: z.object({
            article_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID Artikel tidak valid" }),
          }),
          ReqBody: z.object({
            articles_name: z.string({ message: "Nama invalid" }).min(1, "Nama tidak boleh kosong!"),
            articles_description: z
              .string({ message: "deskripsi invalid!" })
              .min(1, "Deskripsi tidak boleh kosong!"),
            articles_content: z
              .string({ message: "Konten invalid!" })
              .min(1, "Konten tidak boleh kosong!"),
            articles_user_id: z
              .number({ message: "user id invalid!" })
              .min(1, "user id tidak boleh kosong"),
          }),
        },
      }),
      articleDelete: new Route({
        handler: this.articleDelete,
        method: "delete",
        path: "/api/articles/:article_id",
        schema: {
          Params: z.object({
            article_id: z
              .string()
              .min(1)
              .refine((arg) => !isNaN(Number(arg)), { message: "ID Artikel tidak valid!" }),
          }),
        },
      }),
      upvoteAdd: new Route({
        handler: this.upvotePost,
        method: "post",
        path: "/api/articles/upvote",
        schema: {
          ReqBody: z.object({
            article_id: z.number().min(1, "article id tidak valid!"),
            user_id: z.number().min(1, "user id tidak valid!"),
          }),
        },
      }),
      upvoteDelete: new Route({
        handler: this.upvotesDelete,
        method: "delete",
        path: "/api/articles/upvotes",
        schema: {
          ReqBody: z.object({
            article_id: z.number().min(1, "article id tidak valid!"),
            user_id: z.number().min(1, "user id tidak valid!"),
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
      user_id: number;
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
      user_id: number;
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
  private articleAdd: RH<{
    ResBody: {
      articles_name: string;
      articles_description: string;
      articles_content: string;
      user_id: number;
      id: number;
    };
    ReqBody: {
      articles_name: string;
      articles_description: string;
      articles_content: string;
      articles_user_id: number;
    };
  }> = async (req, res) => {
    const { articles_name, articles_description, articles_content, articles_user_id } = req.body;
    const result = await this.article_service.addArticle({
      articles_name,
      articles_description,
      articles_content,
      articles_user_id,
    });
    const resultFinal = await this.article_service.getArticlesById(result.id);
    res.status(201).json(resultFinal);
  };
  private articleUpdate: RH<{
    ResBody: {
      articles_name: string;
      articles_description: string;
      articles_content: string;
      user_id: number;
      id: number;
    };
    ReqBody: {
      articles_name: string;
      articles_description: string;
      articles_content: string;
      articles_user_id: number;
    };
    Params: {
      article_id: string;
    };
  }> = async (req, res) => {
    const article_id = Number(req.params.article_id);
    const obj = req.body;
    const editor_user = req.session.user_id!;

    await this.article_service.updateArticle(article_id, obj, editor_user);
    const result = await this.article_service.getArticlesById(article_id);
    res.status(200).json(result);
  };
  private articleDelete: RH<{
    ResBody: {
      msg: string;
    };
    Params: {
      article_id: string;
    };
  }> = async (req, res) => {
    const article_id = Number(req.params.article_id);
    await this.article_service.deleteArticle(article_id);
    res.status(200).json({ msg: "Artikel berhasil dihapus! " });
  };
  private upvotePost: RH<{
    ResBody: {
      user_id: number;
    }[];
    ReqBody: {
      article_id: number;
      user_id: number;
    };
  }> = async (req, res) => {
    const { article_id, user_id } = req.body;
    const result = this.article_service.upvotesPost({ article_id, user_id });
    const resultFinal = await this.article_service.getArticlesByLikes(article_id);
    res.status(201).json(resultFinal);
  };
  private upvotesDelete: RH<{
    ResBody: {
      msg: string;
    };
    ReqBody: {
      article_id: number;
      user_id: number;
    };
  }> = async (req, res) => {
    const { article_id, user_id } = req.body;
    await this.article_service.upvotesDelete(article_id, user_id);
    res.status(200).json({ msg: "Upvote berhasil dihapus!" });
  };
}
