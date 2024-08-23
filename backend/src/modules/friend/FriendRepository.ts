import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";
import { transfromFriendData } from "./FriendMisc.js";

export class FriendRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getFriends(user_id: number) {
    const result = await this.db
      .selectFrom("ms_friends")
      .select(["ms_friends.from_user_id", "ms_friends.to_user_id", "ms_friends.status"])
      .where((eb) =>
        eb.or([
          eb("ms_friends.from_user_id", "=", user_id),
          eb("ms_friends.to_user_id", "=", user_id),
        ]),
      )
      .execute();

    return result.map((x) => transfromFriendData(x, user_id));
  }

  async getFriendData(from_user_id: number, to_user_id: number) {
    const result = await this.db
      .selectFrom("ms_friends")
      .select([
        "ms_friends.from_user_id",
        "ms_friends.to_user_id",
        "ms_friends.status",
        "ms_friends.created_at",
      ])
      .where((eb) =>
        eb.or([
          eb.and([
            eb("ms_friends.from_user_id", "=", from_user_id),
            eb("ms_friends.to_user_id", "=", to_user_id),
          ]),
          eb.and([
            eb("ms_friends.from_user_id", "=", to_user_id),
            eb("ms_friends.to_user_id", "=", from_user_id),
          ]),
        ]),
      )
      .executeTakeFirst();

    if (result == undefined) {
      return undefined;
    }
    return transfromFriendData(result, from_user_id);
  }

  addFriend(from_user_id: number, to_user_id: number, status: "Accepted" | "Pending") {
    return this.db
      .insertInto("ms_friends")
      .values({
        from_user_id,
        to_user_id,
        status,
      })
      .execute();
  }

  updateFriend(from_user_id: number, to_user_id: number, status: "Accepted" | "Pending") {
    return this.db
      .updateTable("ms_friends")
      .set({
        status,
      })
      .where((eb) =>
        eb.and([
          eb("ms_friends.from_user_id", "=", from_user_id),
          eb("ms_friends.to_user_id", "=", to_user_id),
        ]),
      )
      .execute();
  }

  deleteFriend(user1: number, user2: number) {
    return this.db
      .deleteFrom("ms_friends")
      .where((eb) =>
        eb.or([
          eb.and([
            eb("ms_friends.from_user_id", "=", user2),
            eb("ms_friends.to_user_id", "=", user1),
          ]),
          eb.and([
            eb("ms_friends.from_user_id", "=", user1),
            eb("ms_friends.to_user_id", "=", user2),
          ]),
        ]),
      )
      .execute();
  }
}
