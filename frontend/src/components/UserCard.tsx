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
import { useUsersDetailGet } from "../queries/user_hooks.ts";
import StyledLink from "./StyledLink.tsx";

function UserCard(props: { user_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { user_id, sidebar, subtitle } = props;
  const { data: user_data } = useUsersDetailGet({ user_id });

  if (!user_data) {
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

  return (
    <Card>
      <CardActionArea
        sx={{
          padding: 2,
        }}
      >
        <StyledLink to={`/users/${user_id}`}>
          <Stack direction={"row"} spacing={4} alignItems={"center"}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
              }}
              src={user_data.user_image ?? undefined}
            ></Avatar>
            <Stack>
              <Typography
                variant="h6"
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {user_data.user_name}
              </Typography>
              <Typography variant="body2" color={"GrayText"}>
                {subtitle}
              </Typography>
            </Stack>
          </Stack>
        </StyledLink>
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

export default UserCard;
