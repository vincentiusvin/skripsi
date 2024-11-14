import { Avatar, AvatarProps, Skeleton } from "@mui/material";
import avatarFallback from "../helpers/avatar_fallback.tsx";
import { useUsersDetailGet } from "../queries/user_hooks.ts";

function UserAvatar(props: { user_id: number } & AvatarProps) {
  const { user_id, ...rest } = props;
  const { data: user } = useUsersDetailGet({ user_id });
  if (!user) {
    return <Skeleton />;
  }
  const fallback_img = avatarFallback({ label: user.user_name, seed: user.user_id });

  return <Avatar src={user.user_image ?? fallback_img} {...rest} />;
}
export default UserAvatar;
