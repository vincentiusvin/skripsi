import type { Express } from "express";
import { z } from "zod";
import { Controller, Route } from "../../helpers/controller.js";
import { RH } from "../../helpers/types.js";
import { UserService } from "./UserService.js";

export class UserController extends Controller {
  private user_service: UserService;
  constructor(express_server: Express, user_service: UserService) {
    super(express_server);
    this.user_service = user_service;
  }

  init() {
    return {
      UsersPost: new Route({
        handler: this.postUser,
        method: "post",
        path: "/api/users",
        schema: {
          ReqBody: z.object({
            user_name: z.string().min(1, "Username tidak boleh kosong!"),
            user_password: z.string().min(1, "Password tidak boleh kosong!"),
          }),
        },
      }),

      UsersGet: new Route({
        handler: this.getUser,
        method: "get",
        path: "/api/users",
      }),
    };
  }

  private postUser: RH<{
    ResBody: { user_id: number; user_name: string };
    ReqBody: { user_name: string; user_password: string };
  }> = async (req, res) => {
    const { user_name, user_password } = req.body;

    const user_id = await this.user_service.addUser(user_name, user_password);
    if (user_id == undefined) {
      throw new Error("Gagal menambahkan pengguna!");
    }

    const result = await this.user_service.getUserByID(user_id.id);
    if (result == undefined) {
      throw new Error("Gagal menambahkan pengguna!");
    }

    res.status(201).json(result);
  };

  private getUser: RH<{
    ResBody: { user_id: number; user_name: string }[];
  }> = async (req, res) => {
    const result = await this.user_service.getUsers();
    res.status(200).json(result);
  };
}
