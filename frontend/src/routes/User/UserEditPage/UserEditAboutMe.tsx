import { Skeleton, Stack, TextField } from "@mui/material";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import { useUserEditContext } from "./context.tsx";

function UserEditAboutMe(props: { user_id: number }) {
  const { user_id } = props;
  const [userEdit, setUserEdit] = useUserEditContext();
  const { data } = useUsersDetailGet({
    user_id,
  });

  if (data == undefined) {
    return <Skeleton />;
  }
  return (
    <Stack justifyContent={"center"} height={"100%"}>
      <TextField
        label="Tentang Anda"
        variant="standard"
        fullWidth
        multiline
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_about_me: e.target.value,
          }))
        }
        value={userEdit.user_about_me ?? data.user_about_me ?? ""}
      />
    </Stack>
  );
}

export default UserEditAboutMe;
