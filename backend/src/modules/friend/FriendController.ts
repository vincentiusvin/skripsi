import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { AuthError } from "../../helpers/error.js";
import { validateLogged } from "../../helpers/validate.js";
import { defaultError, zodStringReadableAsNumber } from "../../helpers/validators.js";
import { FriendService } from "./FriendService.js";

const FriendParamsSchema = z.object({
  from_id: zodStringReadableAsNumber("Nomor pengguna pertama tidak valid!"),
  to_id: zodStringReadableAsNumber("Nomor pengguna kedua tidak valid!"),
});

const FriendUpdateSchema = z.object({
  status: z.enum(["Accepted", "Sent", "Pending"], defaultError("Status pertemanan tidak valid!")),
});

const FriendResponseSchema = z.object({
  status: z.enum(["Accepted", "Pending", "Sent", "None"]),
  user_id: z.number(),
});

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
    priors: [validateLogged],
    schema: {
      Params: FriendParamsSchema,
      ReqBody: FriendUpdateSchema,
      ResBody: FriendResponseSchema,
    },
    handler: async (req, res) => {
      const from_user_id = Number(req.params.from_id);
      const to_user_id = Number(req.params.to_id);
      const { status } = req.body;
      const sender_id = Number(req.session.user_id);

      await this.friend_service.updateFriend(from_user_id, to_user_id, status, sender_id);
      const result = await this.friend_service.getFriendStatus(from_user_id, to_user_id);

      res.status(200).json({ status: result, user_id: to_user_id });
    },
  });
  UsersDetailFriendsDetailGet = new Route({
    method: "get",
    path: "/api/users/:from_id/friends/:to_id",
    schema: {
      Params: FriendParamsSchema,
      ResBody: FriendResponseSchema,
    },
    handler: async (req, res) => {
      const from_user_id = Number(req.params.from_id);
      const to_user_id = Number(req.params.to_id);

      const result = await this.friend_service.getFriendStatus(from_user_id, to_user_id);
      res.status(200).json({ status: result, user_id: to_user_id });
    },
  });
  UsersDetailFriendsDetailDelete = new Route({
    method: "delete",
    path: "/api/users/:from_id/friends/:to_id",
    priors: [validateLogged],
    schema: {
      Params: FriendParamsSchema,
      ResBody: z.object({
        msg: z.string(),
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
        user_id: zodStringReadableAsNumber("Nomor pengguna tidak valid!"),
      }),
      ResBody: FriendResponseSchema.array(),
    },
    handler: async (req, res) => {
      const user_id = Number(req.params.user_id);

      const result = await this.friend_service.getFriends(user_id);
      res.status(200).json(result);
    },
  });
}
