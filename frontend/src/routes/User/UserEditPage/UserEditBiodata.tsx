import { Skeleton, Stack, TextField } from "@mui/material";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import UserResetPassword from "./UserResetPassword.tsx";
import { useUserEditContext } from "./context.tsx";

function UserEditBiodata(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useUsersDetailGet({
    user_id,
  });
  const [userEdit, setUserEdit] = useUserEditContext();

  if (data == undefined) {
    return <Skeleton />;
  }

  return (
    <Stack gap={2}>
      <TextField
        label="Username"
        required
        variant="standard"
        value={userEdit.user_name ?? data.user_name}
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_name: e.target.value,
          }))
        }
        fullWidth
      />
      <TextField
        required
        label="Email"
        variant="standard"
        fullWidth
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_email: e.target.value,
          }))
        }
        value={userEdit.user_email ?? data.user_email}
      />
      <TextField
        label="Lokasi"
        fullWidth
        variant="standard"
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_location: e.target.value,
          }))
        }
        value={userEdit.user_location ?? data.user_location ?? ""}
      />
      <TextField
        label="Tempat Kerja"
        fullWidth
        variant="standard"
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_workplace: e.target.value,
          }))
        }
        value={userEdit.user_workplace ?? data.user_workplace ?? ""}
      />
      <TextField
        label="Tingkat Pendidikan"
        fullWidth
        variant="standard"
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_education_level: e.target.value,
          }))
        }
        value={userEdit.user_education_level ?? data.user_education_level ?? ""}
      />
      <TextField
        label="Sekolah/Universitas"
        fullWidth
        variant="standard"
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_school: e.target.value,
          }))
        }
        value={userEdit.user_school ?? data.user_school ?? ""}
      />
      <TextField
        label="Website"
        fullWidth
        variant="standard"
        onChange={(e) =>
          setUserEdit((x) => ({
            ...x,
            user_website: e.target.value,
          }))
        }
        value={userEdit.user_website ?? data.user_website ?? ""}
      />
      <UserResetPassword user_id={user_id} />
    </Stack>
  );
}
export default UserEditBiodata;
