import { Theme } from "@mui/material";
import StyledLink, { StyledLinkProps } from "./StyledLink.tsx";

function ActualStyledLink(props: StyledLinkProps) {
  const { sx, ...rest } = props;
  return (
    <StyledLink
      {...rest}
      sx={{
        ...sx,
        textDecoration: "underline",
        color: (theme: Theme) => theme.palette.primary.main,
        textDecorationColor: (theme: Theme) => theme.palette.primary.dark,
        ":hover": {
          textDecorationColor: undefined,
          textDecorationThickness: "2px",
        },
      }}
    />
  );
}
export default ActualStyledLink;
