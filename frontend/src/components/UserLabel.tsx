import { Skeleton, Stack, Typography } from "@mui/material";
import { useUsersDetailGet } from "../queries/user_hooks.ts";
import UserAvatar from "./UserAvatar.tsx";

function UserLabel(props: {
  user_id: number;
  disableImage?: boolean;
  disableName?: boolean;
  size?: "small" | "regular";
}) {
  const { user_id, size, disableImage, disableName } = props;
  const { data: user } = useUsersDetailGet({ user_id });
  if (!user) {
    return <Skeleton />;
  }

  if (size == "small") {
    return (
      <Stack direction={"row"} textOverflow={"ellipsis"} alignItems={"center"} spacing={1}>
        {!disableImage ? (
          <UserAvatar
            sx={{
              width: 32,
              height: 32,
            }}
            user_id={user_id}
          />
        ) : null}
        {!disableName ? (
          <Typography
            sx={{
              wordBreak: "break-word",
            }}
            variant="body1"
          >
            {user.user_name}
          </Typography>
        ) : null}
      </Stack>
    );
  }

  return (
    <Stack direction={"row"} textOverflow={"ellipsis"} alignItems={"center"} spacing={2}>
      {!disableImage ? <UserAvatar user_id={user_id} /> : null}
      {!disableName ? (
        <Typography
          sx={{
            wordBreak: "break-word",
          }}
          variant="body1"
        >
          {user.user_name}
        </Typography>
      ) : null}
    </Stack>
  );
}
export default UserLabel;
