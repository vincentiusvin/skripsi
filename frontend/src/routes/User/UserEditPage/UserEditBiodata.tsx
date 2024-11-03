import { Skeleton, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import UserResetPassword from "./UserResetPassword.tsx";

function UserEditBiodata(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useUsersDetailGet({
    user_id,
  });
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userEducationLevel, setUserEducationLevel] = useState<string | undefined>(undefined);
  const [userSchool, setUserSchool] = useState<string | undefined>(undefined);

  if (data == undefined) {
    return <Skeleton />;
  }

  return (
    <Stack gap={2}>
      <TextField
        label="Username"
        required
        variant="standard"
        value={userName ?? data.user_name}
        onChange={(e) => setUserName(e.target.value)}
        fullWidth
      />
      <TextField
        required
        label="Email"
        variant="standard"
        fullWidth
        onChange={(e) => setUserEmail(e.target.value)}
        value={userEmail ?? data.user_email}
      />
      <TextField
        label="Tingkat Pendidikan"
        fullWidth
        variant="standard"
        onChange={(e) => setUserEducationLevel(e.target.value)}
        value={userEducationLevel ?? data.user_education_level ?? ""}
      />
      <TextField
        label="Sekolah"
        fullWidth
        variant="standard"
        onChange={(e) => setUserSchool(e.target.value)}
        value={userSchool ?? data.user_school ?? ""}
      />
      <TextField
        label="Website"
        fullWidth
        variant="standard"
        onChange={(e) => setUserSchool(e.target.value)}
        value={userSchool ?? data.user_school ?? ""}
      />
      <UserResetPassword user_id={user_id} />
    </Stack>
  );
}
export default UserEditBiodata;
