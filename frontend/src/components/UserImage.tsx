import { Avatar } from "@mui/material";
import { useUsersDetailGet } from "../queries/user_hooks.ts";

function UserImage(props: { user_id: number }) {
  const { user_id } = props;
  const { data: userDetail } = useUsersDetailGet({
    user_id,
  });
  return (
    <Avatar
      src={userDetail?.user_image ?? ""}
      sx={{
        width: 36,
        height: 36,
      }}
    />
  );
}

export default UserImage;
