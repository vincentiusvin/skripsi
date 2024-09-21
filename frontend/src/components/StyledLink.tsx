import { Link as MuiLink } from "@mui/material";
import { Link as WouterLink, LinkProps as WouterLinkProps } from "wouter";

function StyledLink(props: WouterLinkProps) {
  const { children, ...rest } = props;
  return (
    <WouterLink {...rest} asChild>
      <MuiLink>{children}</MuiLink>
    </WouterLink>
  );
}

export default StyledLink;
