import { LinkProps, Link as MuiLink } from "@mui/material";
import { Link as WouterLink } from "wouter";

export type StyledLinkProps = { to: string } & LinkProps;

function StyledLink(props: StyledLinkProps) {
  const { children, to, ...rest } = props;
  return (
    <MuiLink component={WouterLink} to={to} {...rest}>
      {children}
    </MuiLink>
  );
}

export default StyledLink;
