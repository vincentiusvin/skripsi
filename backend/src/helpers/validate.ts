import { RH } from "./types";

export const validateLogged: RH<{
  ResBody: { msg: string };
}> = function (req, res, next) {
  if (req.session.user_id) {
    next();
  } else {
    res.status(401).json({ msg: "You need to be logged in!" });
  }
};
