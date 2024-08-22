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
      UserDetailFriendDetailPut: new Route({
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
    };
  }

  putUserDetailFriendDetail: RH<{
    Params: { from_id: string; to_id: string };
    ReqBody: {
      status: "Pending" | "Accepted";
    };
    ResBody: {
      user_id: number;
      status: FriendStatus;
    };
  }> = async (req, res) => {
    const from_user_id = Number(req.params.from_id);
    const to_user_id = Number(req.params.to_id);
    const { status } = req.body;

    if (status === "Accepted") {
      await this.friend_service.acceptFriend(from_user_id, to_user_id);
    } else if (status === "Pending") {
      await this.friend_service.addFriend(from_user_id, to_user_id);
    }

    const result = await this.friend_service.getFriendData(from_user_id, to_user_id);
    res.status(200).json(result);
  };
}
