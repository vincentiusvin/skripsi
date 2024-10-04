import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller";
import { zodStringReadableAsNumber } from "../../helpers/validators.js";
import { ArticleService } from "./ArticleService";

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
      ArticlesDetailDelete: this.ArticlesDetailDelete,
      UpvoteAdd: this.UpvoteAdd,
      UpvoteDelete: this.UpvoteDelete,
      ArticleGetLikesId: this.ArticleGetLikesId,
    };
  }

  ArticlesGet = new Route({
    method: "get",
    path: "/api/articles",
    schema: {
      ResBody: z
        .object({
          article_id: z.number(),
          user_id: z.number(),
          article_name: z.string(),
          article_description: z.string(),
        })
        .array(),
    },
    handler: async (req, res) => {
      const result = await this.article_service.getArticles();
      res.status(200).json(result);
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
          articles_count: z.number(),
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
        const res = await this.article_service.getArticleCount(id);
        if (res == undefined) {
          throw new Error("Gagal menghitung upvote!");
        }
        result = {
          articles_count: Number(res.articles_count),
        };
      } else {
        result = await this.article_service.getArticlesByLikes(id);
      }
      res.status(200).json(result);
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
      }),
      ResBody: z.object({
        user_id: z.number(),
        articles_name: z.string(),
        articles_content: z.string(),
        id: z.number(),
        articles_description: z.string(),
      }),
    },
    handler: async (req, res) => {
      const { articles_name, articles_description, articles_content, articles_user_id } = req.body;
      const result = await this.article_service.addArticle({
        articles_name,
        articles_description,
        articles_content,
        articles_user_id,
      });
      const resultFinal = await this.article_service.getArticlesById(result.id);
      res.status(201).json(resultFinal);
    },
  });

  ArticlesDetailPut = new Route({
    method: "put",
    path: "/api/articles/:id",
    schema: {
      Params: z.object({
        article_id: zodStringReadableAsNumber("ID Artikel tidak valid"),
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
      ResBody: z.object({
        user_id: z.number(),
        articles_name: z.string(),
        articles_content: z.string(),
        id: z.number(),
        articles_description: z.string(),
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
