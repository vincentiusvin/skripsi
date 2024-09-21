import { Avatar, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ReactNode } from "react";
import { useUsersDetailGet } from "../queries/user_hooks.ts";
import StyledLink from "./StyledLink.tsx";

function UserCard(props: { user_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { user_id, sidebar, subtitle } = props;
  const { data: user_data } = useUsersDetailGet({ user_id });

  if (!user_data) {
    return (
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
    );
  }

  return (
    <Grid container alignItems={"center"} rowGap={2} height={"100%"} width={"100%"}>
      <Grid
        size={{
          xs: 12,
          lg: sidebar ? 6 : 12,
        }}
      >
        <Stack direction={"row"} spacing={4} alignItems={"center"}>
          <StyledLink to={`/users/${user_id}`}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
              }}
              src={user_data.user_image ?? undefined}
            ></Avatar>
          </StyledLink>
          <Stack>
            <StyledLink to={`/users/${user_id}`}>
              <Typography
                variant="h6"
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {user_data.user_name}
              </Typography>
            </StyledLink>
            <Typography variant="body2" color={"GrayText"}>
              {subtitle}
            </Typography>
          </Stack>
        </Stack>
      </Grid>
      {sidebar ? (
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <Stack spacing={2}>{sidebar}</Stack>
        </Grid>
      ) : null}
    </Grid>
  );
}

export default UserCard;
