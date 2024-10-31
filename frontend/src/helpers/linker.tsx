import { Facebook, GitHub, Instagram, LinkedIn, Telegram, X, YouTube } from "@mui/icons-material";
import { Link } from "@mui/material";
import { get } from "psl";

export const LinkIcons = {
  X: <X />,
  LinkedIn: <LinkedIn />,
  Instagram: <Instagram />,
  Facebook: <Facebook />,
  Telegram: <Telegram />,
  Github: <GitHub />,
  YouTube: <YouTube />,
  Other: <Link />,
};

export function linkParser(url: string): keyof typeof LinkIcons {
  const domain = get(url);
  if (domain === "x.com" || domain === "twitter.com") {
    return "X";
  } else if (domain === "linkedin.com") {
    return "LinkedIn";
  }
  return "X";
}
