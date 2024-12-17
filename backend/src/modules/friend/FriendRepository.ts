import { Kysely } from "kysely";
import { DB } from "../../db/db_types.js";
import { transfromFriendData } from "./FriendMisc.js";

const defaultFriendFields = [
  "friends.from_user_id",
  "friends.to_user_id",
  "friends.status",
  "friends.created_at",
] as const;

export class FriendRepository {
  private db: Kysely<DB>;
  constructor(db: Kysely<DB>) {
    this.db = db;
  }

  async getFriends(user_id: number) {
    const result = await this.db
      .selectFrom("friends")
      .select(defaultFriendFields)
      .where((eb) =>
        eb.or([eb("friends.from_user_id", "=", user_id), eb("friends.to_user_id", "=", user_id)]),
      )
      .execute();

    return result.map((x) => transfromFriendData(x, user_id));
  }

  async getFriendData(from_user_id: number, to_user_id: number) {
    const result = await this.db
      .selectFrom("friends")
      .select(defaultFriendFields)
      .where((eb) =>
        eb.or([
          eb.and([
            eb("friends.from_user_id", "=", from_user_id),
            eb("friends.to_user_id", "=", to_user_id),
          ]),
          eb.and([
            eb("friends.from_user_id", "=", to_user_id),
            eb("friends.to_user_id", "=", from_user_id),
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
      .insertInto("friends")
      .values({
        from_user_id,
        to_user_id,
        status,
      })
      .execute();
  }

  updateFriend(from_user_id: number, to_user_id: number, status: "Accepted" | "Pending") {
    return this.db
      .updateTable("friends")
      .set({
        status,
      })
      .where((eb) =>
        eb.and([
          eb("friends.from_user_id", "=", from_user_id),
          eb("friends.to_user_id", "=", to_user_id),
        ]),
      )
      .execute();
  }

  deleteFriend(user1: number, user2: number) {
    return this.db
      .deleteFrom("friends")
      .where((eb) =>
        eb.or([
          eb.and([eb("friends.from_user_id", "=", user2), eb("friends.to_user_id", "=", user1)]),
          eb.and([eb("friends.from_user_id", "=", user1), eb("friends.to_user_id", "=", user2)]),
        ]),
      )
      .execute();
  }
}
