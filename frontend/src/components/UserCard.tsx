import { Avatar, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useUsersDetailGet } from "../queries/user_hooks.ts";

function UserCard(props: { user_id: number; subtitle?: ReactNode; sidebar?: ReactNode }) {
  const { user_id, sidebar, subtitle } = props;
  const { data: user_data } = useUsersDetailGet({ user_id });

  if (!user_data) {
    return (
      <Grid container minWidth={280} spacing={4} alignItems={"center"}>
        <Grid item xs={2}>
          <Avatar src={undefined}></Avatar>
        </Grid>
        <Grid item xs={4}>
          <Skeleton width={"100%"}></Skeleton>
        </Grid>
      </Grid>
    );
  }

  if (sidebar) {
    return (
      <Grid container width={280} spacing={4} alignItems={"center"}>
        <Grid item xs={4} lg={2}>
          <Avatar src={user_data.user_image ?? undefined}></Avatar>
        </Grid>
        <Grid item xs={8} lg={4}>
          <Stack>
            <Typography>{user_data.user_name}</Typography>
            <Typography variant="body2" color={"GrayText"}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Stack spacing={2}>{sidebar}</Stack>
        </Grid>
      </Grid>
    );
  } else {
    return (
      <Grid container width={140} spacing={4} alignItems={"center"}>
        <Grid item xs={4}>
          <Avatar src={user_data.user_image ?? undefined}></Avatar>
        </Grid>
        <Grid item xs={8}>
          <Stack>
            <Typography>{user_data.user_name}</Typography>
            <Typography variant="body2" color={"GrayText"}>
              {subtitle}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    );
  }
}

export default UserCard;
