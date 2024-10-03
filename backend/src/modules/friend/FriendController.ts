import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { AuthError } from "../../helpers/error.js";
import { FriendService } from "./FriendService.js";

export class FriendController extends Controller {
  private friend_service: FriendService;
  constructor(express_server: Express, friend_service: FriendService) {
    super(express_server);
    this.friend_service = friend_service;
  }

  init() {
    return {
      UsersDetailFriendsDetailPut: this.UsersDetailFriendsDetailPut,
      UsersDetailFriendsDetailGet: this.UsersDetailFriendsDetailGet,
      UsersDetailFriendsDetailDelete: this.UsersDetailFriendsDetailDelete,
      UsersDetailFriendsGet: this.UsersDetailFriendsGet,
    };
  }

  UsersDetailFriendsDetailPut = new Route({
    method: "put",
    path: "/api/users/:from_id/friends/:to_id",
    schema: {
      Params: z.object({
        from_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID user pertama tidak valid!" }),
        to_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID user kedua tidak valid!" }),
      }),
    },
    handler: async (req, res) => {
      const from_user_id = Number(req.params.from_id);
      const to_user_id = Number(req.params.to_id);
      const { status } = req.body;

      if (from_user_id != req.session.user_id) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah koneksi orang lain!");
      }

      if (status === "Accepted") {
        await this.friend_service.acceptFriend(from_user_id, to_user_id);
      } else if (status === "Sent") {
        await this.friend_service.addFriend(from_user_id, to_user_id);
      }

      const result = await this.friend_service.getFriendStatus(from_user_id, to_user_id);
      res.status(200).json({ status: result });
    },
  });
  UsersDetailFriendsDetailGet = new Route({
    method: "get",
    path: "/api/users/:from_id/friends/:to_id",
    schema: {
      Params: z.object({
        from_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID user pertama tidak valid!" }),
        to_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID user kedua tidak valid!" }),
      }),
    },
    handler: async (req, res) => {
      const from_user_id = Number(req.params.from_id);
      const to_user_id = Number(req.params.to_id);

      const result = await this.friend_service.getFriendStatus(from_user_id, to_user_id);
      res.status(200).json({ status: result });
    },
  });
  UsersDetailFriendsDetailDelete = new Route({
    method: "delete",
    path: "/api/users/:from_id/friends/:to_id",
    schema: {
      Params: z.object({
        from_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID user pertama tidak valid!" }),
        to_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID user kedua tidak valid!" }),
      }),
    },
    handler: async (req, res) => {
      const from_user_id = Number(req.params.from_id);
      const to_user_id = Number(req.params.to_id);

      if (from_user_id != req.session.user_id) {
        throw new AuthError("Anda tidak memiliki akses untuk mengubah koneksi orang lain!");
      }

      await this.friend_service.deleteFriend(from_user_id, to_user_id);
      res.status(200).json({ msg: "Teman berhasil dihapus!" });
    },
  });
  UsersDetailFriendsGet = new Route({
    method: "get",
    path: "/api/users/:user_id/friends",
    schema: {
      Params: z.object({
        user_id: z
          .string()
          .min(1)
          .refine((arg) => !isNaN(Number(arg)), { message: "ID user pertama tidak valid!" }),
      }),
    },
    handler: async (req, res) => {
      const user_id = Number(req.params.user_id);

      const result = await this.friend_service.getFriends(user_id);
      res.status(200).json(result);
    },
  });
}
