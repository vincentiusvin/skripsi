import { LinkProps, Link as MuiLink } from "@mui/material";
import { Link as WouterLink } from "wouter";

function StyledLink(props: { to: string } & LinkProps) {
  const { children, to, ...rest } = props;
  return (
    <MuiLink component={WouterLink} to={to} {...rest}>
      {children}
    </MuiLink>
  );
}

export default StyledLink;
