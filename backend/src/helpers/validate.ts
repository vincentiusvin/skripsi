import { AuthError } from "./error";
import { RH } from "./types";

export const validateLogged: RH<{
  ResBody: { msg: string };
}> = function (req, res, next) {
  if (req.session.user_id) {
    next();
  } else {
    throw new AuthError("You need to be logged in!");
  }
};
