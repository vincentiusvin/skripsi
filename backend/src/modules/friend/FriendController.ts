import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { FriendStatus } from "./FriendMisc.js";
import { FriendService } from "./FriendService.js";

export class FriendController extends Controller {
  private friend_service: FriendService;
  constructor(express_server: Express, friend_service: FriendService) {
    super(express_server);
    this.friend_service = friend_service;
  }

  init() {
    return {
      UsersDetailFriendsDetailPut: new Route({
        handler: this.putUserDetailFriendDetail,
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
      }),
      UsersDetailFriendsDetailGet: new Route({
        handler: this.getUserDetailFriendDetail,
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
      }),
      UsersDetailFriendsDetailDelete: new Route({
        handler: this.deleteUserDetailFriendDetail,
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
      }),
      UsersDetailFriendsGet: new Route({
        handler: this.getUserDetailFriend,
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
      }),
    };
  }

  putUserDetailFriendDetail: RH<{
    Params: { from_id: string; to_id: string };
    ReqBody: {
      status: "Sent" | "Accepted";
    };
    ResBody: {
      status: FriendStatus;
    };
  }> = async (req, res) => {
    const from_user_id = Number(req.params.from_id);
    const to_user_id = Number(req.params.to_id);
    const { status } = req.body;

    if (status === "Accepted") {
      await this.friend_service.acceptFriend(from_user_id, to_user_id);
    } else if (status === "Sent") {
      await this.friend_service.addFriend(from_user_id, to_user_id);
    }

    const result = await this.friend_service.getFriendStatus(from_user_id, to_user_id);
    res.status(200).json({ status: result });
  };

  getUserDetailFriendDetail: RH<{
    Params: { from_id: string; to_id: string };
    ResBody: {
      status: FriendStatus;
    };
  }> = async (req, res) => {
    const from_user_id = Number(req.params.from_id);
    const to_user_id = Number(req.params.to_id);

    const result = await this.friend_service.getFriendStatus(from_user_id, to_user_id);
    res.status(200).json({ status: result });
  };

  deleteUserDetailFriendDetail: RH<{
    Params: { from_id: string; to_id: string };
    ResBody: {
      msg: string;
    };
  }> = async (req, res) => {
    const from_user_id = Number(req.params.from_id);
    const to_user_id = Number(req.params.to_id);

    await this.friend_service.deleteFriend(from_user_id, to_user_id);
    res.status(200).json({ msg: "Teman berhasil dihapus!" });
  };

  getUserDetailFriend: RH<{
    Params: { user_id: string };
    ResBody: {
      status: FriendStatus;
      user_id: number;
    }[];
  }> = async (req, res) => {
    const user_id = Number(req.params.user_id);

    const result = await this.friend_service.getFriends(user_id);
    res.status(200).json(result);
  };
}
