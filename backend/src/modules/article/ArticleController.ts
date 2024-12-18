import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
import { validateLogged } from "../../helpers/validate.js";
import {
  defaultError,
  zodPagination,
  zodStringReadableAsNumber,
} from "../../helpers/validators.js";
import { ArticleService } from "./ArticleService";

declare module "express-session" {
  interface SessionData {
    user_id?: number;
  }
}

const ArticleResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  description: z.string(),
  image: z.string().nullable().optional(),
  content: z.string(),
  created_at: z.date(),
});

const ArticleParamSchema = z.object({
  article_id: zodStringReadableAsNumber("Nomor artikel tidak valid!"),
});

const ArticleUpdateSchema = z
  .object({
    name: z.string(defaultError("Nama artikel tidak valid!")).min(1).optional(),
    description: z.string(defaultError("Deskripsi artikel tidak valid!")).min(1).optional(),
    content: z.string(defaultError("Konten artikel tidak valid!")).min(1).optional(),
    image: z.string(defaultError("Gambar artikel tidak valid!")).nullable().optional(),
  })
  .strict();

const ArticleCreationSchema = z
  .object({
    name: z.string(defaultError("Nama artikel tidak valid!")).min(1),
    description: z.string(defaultError("Deskripsi artikel tidak valid!")).min(1),
    content: z.string(defaultError("Konten artikel tidak valid!")).min(1),
    image: z.string(defaultError("Gambar artikel tidak valid!")).nullable().optional(),
  })
  .strict();

const ArticleLikesParamSchema = z.object({
  article_id: zodStringReadableAsNumber("Nomor artikel tidak valid!"),
  user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!"),
});

const ArticleLikesResponseSchema = z.object({
  like: z.boolean(defaultError("Status suka tidka valid!")),
});

const ArticleCommentResponseSchema = z.object({
  id: z.number(),
  article_id: z.number(),
  user_id: z.number(),
  comment: z.string(),
  created_at: z.date(),
});

const ArticleCommentCreationSchema = z.object({
  comment: z.string(defaultError("Komentar tidak valid!")).min(1),
});

export class ArticleController extends Controller {
  private article_service: ArticleService;
  constructor(express_server: Express, article_service: ArticleService) {
    super(express_server);
    this.article_service = article_service;
  }

  init() {
    return {
      ArticlesGet: this.ArticlesGet,
      ArticlesDetailGet: this.ArticlesDetailGet,
      ArticlesPost: this.ArticlesPost,
      ArticlesDetailPut: this.ArticlesDetailPut,
      ArticlesDetailDelete: this.ArticlesDetailDelete,
      ArticlesDetailLikesGet: this.ArticlesDetailLikesGet,
      ArticlesDetailLikesDetailGet: this.ArticlesDetailLikesDetailGet,
      ArticlesDetailLikesDetailPut: this.ArticlesDetailLikesDetailPut,
      ArticlesDetailLikesDetailDelete: this.ArticlesDetailLikesDetailDelete,
      ArticlesDetailCommentsGet: this.ArticlesDetailCommentsGet,
      ArticlesDetailCommentsPost: this.ArticlesDetailCommentsPost,
    };
  }

  ArticlesGet = new Route({
    method: "get",
    path: "/api/articles",
    schema: {
      ReqQuery: z.object({
        keyword: z.string(defaultError("Nama artikel tidak valid!")).min(1).optional(),
        ...zodPagination(),
      }),
      ResBody: z.object({
        result: ArticleResponseSchema.array(),
        total: z.number(),
      }),
    },
    handler: async (req, res) => {
      const { limit, page, keyword } = req.query;
      const opts = {
        keyword: keyword != undefined && keyword.length > 0 ? keyword : undefined,
        limit: limit != undefined ? Number(limit) : undefined,
        page: limit != undefined ? Number(page) : undefined,
      };
      const result = await this.article_service.getArticles(opts);
      const count = await this.article_service.countArticles(opts);

      res.status(200).json({ result, total: Number(count.count) });
    },
  });

  ArticlesDetailGet = new Route({
    method: "get",
    path: "/api/articles/:article_id",
    schema: {
      Params: ArticleParamSchema,
      ResBody: ArticleResponseSchema,
    },
    handler: async (req, res) => {
      const id = Number(req.params.article_id);
      const result = await this.article_service.getArticlesById(id);
      res.status(200).json(result);
    },
  });

  ArticlesPost = new Route({
    method: "post",
    path: "/api/articles",
    schema: {
      ReqBody: ArticleCreationSchema,
      ResBody: ArticleResponseSchema,
    },
    priors: [validateLogged],
    handler: async (req, res) => {
      const { image, ...obj } = req.body;
      const sender_id = req.session.user_id!;

      const article = await this.article_service.addArticle({
        ...obj,
        user_id: sender_id,
        image: image ?? undefined,
      });

      const result = await this.article_service.getArticlesById(article.id);
      res.status(201).json(result);
    },
  });

  ArticlesDetailPut = new Route({
    method: "put",
    path: "/api/articles/:article_id",
    schema: {
      Params: ArticleParamSchema,
      ReqBody: ArticleUpdateSchema,
      ResBody: ArticleResponseSchema,
    },
    priors: [validateLogged],
    handler: async (req, res) => {
      const article_id = Number(req.params.article_id);

      const obj = req.body;
      const sender_id = req.session.user_id!;

      await this.article_service.updateArticle(article_id, obj, sender_id);
      const result = await this.article_service.getArticlesById(article_id);

      res.status(200).json(result);
    },
  });

  ArticlesDetailDelete = new Route({
    method: "delete",
    path: "/api/articles/:article_id",
    schema: {
      Params: ArticleParamSchema,
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    priors: [validateLogged],
    handler: async (req, res) => {
      const article_id = Number(req.params.article_id);
      const sender_id = req.session.user_id!;

      await this.article_service.deleteArticle(article_id, sender_id);
      res.status(200).json({ msg: "Artikel berhasil dihapus! " });
    },
  });

  ArticlesDetailLikesGet = new Route({
    method: "get",
    path: "/api/articles/:article_id/likes",
    schema: {
      Params: ArticleParamSchema,
      ResBody: z.object({
        likes: z.number(),
      }),
    },
    handler: async (req, res) => {
      const article_id = Number(req.params.article_id);
      const result = await this.article_service.getArticleLikeCount(article_id);
      res.status(200).json({ likes: Number(result?.likes ?? 0) });
    },
  });

  ArticlesDetailLikesDetailGet = new Route({
    method: "get",
    path: "/api/articles/:article_id/likes/:user_id",
    schema: {
      Params: ArticleLikesParamSchema,
      ResBody: ArticleLikesResponseSchema,
    },
    handler: async (req, res) => {
      const { article_id: article_id_raw, user_id: user_id_raw } = req.params;
      const article_id = Number(article_id_raw);
      const user_id = Number(user_id_raw);

      const result = await this.article_service.getArticleLikeStatus(article_id, user_id);
      res.status(200).json(result);
    },
  });

  ArticlesDetailLikesDetailPut = new Route({
    method: "put",
    path: "/api/articles/:article_id/likes/:user_id",
    schema: {
      Params: ArticleLikesParamSchema,
      ResBody: ArticleLikesResponseSchema,
      ReqBody: ArticleLikesResponseSchema,
    },
    priors: [validateLogged],
    handler: async (req, res) => {
      const { article_id: article_id_raw, user_id: user_id_raw } = req.params;
      const article_id = Number(article_id_raw);
      const sender_id = req.session.user_id!;
      const user_id = Number(user_id_raw);

      await this.article_service.likeArticle(article_id, user_id, sender_id);
      const result = await this.article_service.getArticleLikeStatus(article_id, user_id);
      res.status(200).json(result);
    },
  });

  ArticlesDetailLikesDetailDelete = new Route({
    method: "delete",
    path: "/api/articles/:article_id/likes/:user_id",
    schema: {
      Params: ArticleLikesParamSchema,
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    priors: [validateLogged],
    handler: async (req, res) => {
      const { article_id: article_id_raw, user_id: user_id_raw } = req.params;
      const article_id = Number(article_id_raw);
      const sender_id = req.session.user_id!;
      const user_id = Number(user_id_raw);

      await this.article_service.unlikeArticle(article_id, user_id, sender_id);
      res.status(200).json({ msg: "Status suka berhasil dihapus!" });
    },
  });

  ArticlesDetailCommentsGet = new Route({
    method: "get",
    path: "/api/articles/:article_id/comments",
    schema: {
      Params: ArticleParamSchema,
      ResBody: ArticleCommentResponseSchema.array(),
    },
    handler: async (req, res) => {
      const article_id = Number(req.params.article_id);
      const result = await this.article_service.getArticlesComment(article_id);
      res.status(200).json(result);
    },
  });

  ArticlesDetailCommentsPost = new Route({
    method: "post",
    path: "/api/articles/:article_id/comments",
    schema: {
      Params: ArticleParamSchema,
      ReqBody: ArticleCommentCreationSchema,
      ResBody: ArticleCommentResponseSchema,
    },
    priors: [validateLogged],
    handler: async (req, res) => {
      const article_id = Number(req.params.article_id);
      const user_id = req.session.user_id!;
      const { comment } = req.body;

      const id = await this.article_service.addComment({
        article_id,
        user_id,
        comment,
      });

      const result = await this.article_service.getCommentByID(id.id);
      res.status(201).json(result);
    },
  });
}
