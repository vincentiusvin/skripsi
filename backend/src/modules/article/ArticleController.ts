import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
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
      ArticlesDetailCommentsGet: this.ArticlesDetailCommentsGet,
      ArticlesPost: this.ArticlesPost,
      ArticlesDetailPut: this.ArticlesDetailPut,
      UpvoteDelete: this.UpvoteDelete,
      ArticlesDetailDelete: this.ArticlesDetailDelete,
      UpvoteAdd: this.UpvoteAdd,
      ArticleGetLikesId: this.ArticleGetLikesId,
      ArticlesDetailCommentsPost: this.ArticlesDetailCommentsPost,
      ArticlePostLike: this.ArticlePostLike,
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
        result: z.array(
          z.object({
            article_id: z.number(),
            user_id: z.number(),
            article_name: z.string(),
            article_description: z.string(),
            article_image: z.string().nullable().optional(),
          }),
        ),
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
    path: "/api/articles/:id",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID artikel tidak boleh kosong!"),
      }),
      ResBody: z.object({
        user_id: z.number(),
        articles_name: z.string(),
        articles_content: z.string(),
        id: z.number(),
        articles_description: z.string(),
        articles_image: z.string().nullable(),
      }),
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const result = await this.article_service.getArticlesById(id);
      res.status(200).json(result);
    },
  });

  ArticlesDetailCommentsGet = new Route({
    method: "get",
    path: "/api/articles/:id/comments",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID artikel tidak boleh kosong!"),
      }),
      ResBody: z
        .object({
          comment: z.string(),
          user_id: z.number(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const result = await this.article_service.getArticlesComment(id);
      res.status(200).json(result);
    },
  });

  ArticleGetLikesId = new Route({
    method: "get",
    path: "/api/articles/:id/upvotes",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID artikel tidak boleh kosong!"),
      }),
      ReqQuery: z.object({
        count: z.string().optional(),
      }),
      ResBody: z.union([
        z.object({
          articles_count: z.unknown(),
        }),
        z.array(
          z.object({
            user_id: z.number(),
          }),
        ),
      ]),
    },
    handler: async (req, res) => {
      const id = Number(req.params.id);
      const count = req.query.count === "True";
      let result;
      if (count) {
        result = await this.article_service.getArticleCount(id);
      } else {
        result = await this.article_service.getArticlesByLikes(id);
      }
      res.status(200).json(result);
    },
  });

  ArticlePostLike = new Route({
    method: "post",
    path: "/api/articles/addLikes",
    schema: {
      ReqBody: z.object({
        article_id: z.number().min(1, "article_id tidak valid"),
        user_id: z.number().min(1, "user_id invalid!"),
      }),
      ResBody: z.object({
        article_id: z.number(),
        user_id: z.number(),
      }),
    },
    handler: async (req, res) => {
      const article_id = Number(req.body.article_id);
      const user_id = req.body.user_id;

      const result = await this.article_service.addArticleLike(article_id, user_id);
      res.status(201).json(result);
    },
  });

  ArticlesDetailCommentsPost = new Route({
    method: "post",
    path: "/api/articles/:id/addComents",
    schema: {
      Params: z.object({
        id: zodStringReadableAsNumber("ID artikel tidak boleh kosong!"),
      }),
      ReqBody: z.object({
        comment: z.string().min(1, "Comment tidak boleh kosong!"),
        user_id: z.number().min(1, "user_id invalid!"),
      }),
      ResBody: z.object({
        comment_id: z.number(),
        article_id: z.number(),
        user_id: z.number(),
        comment: z.string(),
      }),
    },
    handler: async (req, res) => {
      const article_id = Number(req.params.id); // Extract article ID from params
      const { comment, user_id } = req.body; // Extract comment and user ID from body

      // Call service to add the comment
      const result = await this.article_service.addComment({
        article_id,
        user_id,
        comment,
      });

      // Respond with the inserted comment
      res.status(201).json(result);
    },
  });

  ArticlesPost = new Route({
    method: "post",
    path: "/api/articles",
    schema: {
      ReqBody: z.object({
        articles_name: z.string().min(1, "Nama artikel tidak boleh kosong!"),
        articles_description: z.string().min(1, "Deskripsi artikel tidak boleh kosong"),
        articles_content: z.string().min(1, "Content artikel tidak boleh kosong!"),
        articles_user_id: z.number().min(1, "user_id invalid!"),
        articles_image: z.string().min(1).optional(),
      }),
      ResBody: z.object({
        user_id: z.number(),
        articles_name: z.string(),
        articles_content: z.string(),
        id: z.number(),
        articles_description: z.string(),
        articles_image: z.string().nullable(),
      }),
    },
    // priors: [validateLogged],
    handler: async (req, res) => {
      const {
        articles_name,
        articles_description,
        articles_content,
        articles_user_id,
        articles_image,
      } = req.body;
      const result = await this.article_service.addArticle({
        articles_name,
        articles_description,
        articles_content,
        articles_user_id,
        articles_image,
      });
      const resultFinal = await this.article_service.getArticlesById(result.id);
      res.status(201).json(resultFinal);
    },
  });

  ArticlesDetailPut = new Route({
    method: "put",
    path: "/api/articles/:article_id",
    schema: {
      Params: z.object({
        article_id: zodStringReadableAsNumber("ID Artikel tidak valid"),
      }),
      ReqBody: z.object({
        articles_name: z
          .string({ message: "Nama invalid" })
          .min(1, "Nama tidak boleh kosong!")
          .optional(),
        articles_description: z
          .string({ message: "deskripsi invalid!" })
          .min(1, "Deskripsi tidak boleh kosong!")
          .optional(),
        articles_content: z
          .string({ message: "Konten invalid!" })
          .min(1, "Konten tidak boleh kosong!")
          .optional(),
        articles_user_id: z
          .number({ message: "user id invalid!" })
          .min(1, "user id tidak boleh kosong"),
        articles_image: z.string({ message: "Gambar tidak valid!" }).nullable().optional(),
      }),
      ResBody: z.object({
        user_id: z.number(),
        articles_name: z.string(),
        articles_content: z.string(),
        id: z.number(),
        articles_description: z.string(),
        articles_image: z.string().nullable(),
      }),
    },
    handler: async (req, res) => {
      const article_id = Number(req.params.article_id);
      const obj = req.body;
      const editor_user = req.session.user_id!;

      await this.article_service.updateArticle(article_id, obj, editor_user);
      const result = await this.article_service.getArticlesById(article_id);

      res.status(200).json(result);
    },
  });

  ArticlesDetailDelete = new Route({
    method: "delete",
    path: "/api/articles/:article_id",
    schema: {
      Params: z.object({
        article_id: zodStringReadableAsNumber("ID Artikel tidak valid!"),
      }),
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const article_id = Number(req.params.article_id);
      await this.article_service.deleteArticle(article_id);
      res.status(200).json({ msg: "Artikel berhasil dihapus! " });
    },
  });

  UpvoteAdd = new Route({
    method: "post",
    path: "/api/articles/upvote",
    schema: {
      ReqBody: z.object({
        article_id: z.number().min(1, "article id tidak valid!"),
        user_id: z.number().min(1, "user id tidak valid!"),
      }),
      ResBody: z
        .object({
          user_id: z.number(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const { article_id, user_id } = req.body;
      await this.article_service.upvotesPost({ article_id, user_id });
      const resultFinal = await this.article_service.getArticlesByLikes(article_id);
      res.status(201).json(resultFinal);
    },
  });

  UpvoteDelete = new Route({
    method: "delete",
    path: "/api/articles/upvotes",
    schema: {
      ReqBody: z.object({
        article_id: z.number().min(1, "article id tidak valid!"),
        user_id: z.number().min(1, "user id tidak valid!"),
      }),
      ResBody: z.object({
        msg: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { article_id, user_id } = req.body;
      await this.article_service.upvotesDelete(article_id, user_id);
      res.status(200).json({ msg: "Upvote berhasil dihapus!" });
    },
  });
}
