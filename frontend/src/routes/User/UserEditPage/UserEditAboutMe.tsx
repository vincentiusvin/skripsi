import { Skeleton, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";

function UserEditAboutMe(props: { user_id: number }) {
  const { user_id } = props;
  const [userAboutMe, setUserAboutMe] = useState<string | undefined>(undefined);
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
        onChange={(e) => setUserAboutMe(e.target.value)}
        value={userAboutMe ?? data.user_about_me ?? ""}
      />
    </Stack>
  );
}

export default UserEditAboutMe;
