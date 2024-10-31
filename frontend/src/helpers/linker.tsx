import {
  Facebook,
  GitHub,
  Google,
  Instagram,
  Link,
  LinkedIn,
  Telegram,
  X,
  YouTube,
} from "@mui/icons-material";
import { get } from "psl";

export const LinkIcons = {
  X: <X />,
  LinkedIn: <LinkedIn />,
  Instagram: <Instagram />,
  Facebook: <Facebook />,
  Telegram: <Telegram />,
  Github: <GitHub />,
  Google: <Google />,
  YouTube: <YouTube />,
  Other: <Link />,
};

export function parseURL(url: string): URL {
  return new URL(url.startsWith("http") ? url : `https:${url}`);
}

export function linkParser(url: string): keyof typeof LinkIcons {
  let parsedUrl: URL;
  try {
    parsedUrl = parseURL(url);
  } catch (e) {
    return "Other";
  }

  const domain = get(parsedUrl.hostname);
  if (domain === "x.com" || domain === "twitter.com") {
    return "X";
  } else if (domain === "linkedin.com") {
    return "LinkedIn";
  } else if (domain === "instagram.com") {
    return "Instagram";
  } else if (domain === "facebook.com") {
    return "Facebook";
  } else if (domain === "telegram.org") {
    return "Telegram";
  } else if (domain === "github.com") {
    return "Github";
  } else if (domain === "google.com") {
    return "Google";
  } else if (domain === "youtube.com") {
    return "YouTube";
  }
  return "Other";
}
