import {
  Avatar,
  Card,
  CardActionArea,
  CardActions,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import StyledLink from "../StyledLink.tsx";

function BaseCard(props: {
  image?: string;
  isLoading: boolean;
  link?: string;
  title?: string;
  subtitle?: ReactNode;
  sidebar?: ReactNode;
}) {
  const { image, title, link, sidebar, subtitle, isLoading } = props;

  if (isLoading) {
    return (
      <Paper>
        <Stack direction="row" spacing={4} alignItems="center" height="100%" width={"100%"}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
            }}
            src={undefined}
          ></Avatar>
          <Skeleton width={"100%"}></Skeleton>
        </Stack>
      </Paper>
    );
  }

  const header = (
    <Stack direction={"row"} spacing={4} alignItems={"center"}>
      <Avatar
        sx={{
          width: 36,
          height: 36,
        }}
        src={image}
      ></Avatar>
      <Stack>
        <Typography
          variant="h6"
          sx={{
            wordBreak: "break-word",
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" color={"textSecondary"}>
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  );

  return (
    <Card>
      <CardActionArea
        sx={{
          padding: 2,
        }}
        disabled={link == undefined}
      >
        {link ? <StyledLink to={link}>{header}</StyledLink> : header}
      </CardActionArea>
      {sidebar ? (
        <CardActions
          sx={{
            paddingX: 2,
          }}
        >
          {sidebar}
        </CardActions>
      ) : null}
    </Card>
  );
}
export default BaseCard;
