import { InputAdornment, Skeleton, Stack, TextField } from "@mui/material";
import { useUsersDetailGet } from "../../../queries/user_hooks.ts";
import UserChangeEmail from "./UserChangeEmail.tsx";
import UserChangePassword from "./UserChangePassword.tsx";
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
      <Stack direction="row">
        <TextField
          required
          label="Email"
          variant="standard"
          disabled
          fullWidth
          onChange={(e) =>
            setUserEdit((x) => ({
              ...x,
              user_email: e.target.value,
            }))
          }
          value={userEdit.user_email ?? data.user_email}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="start">
                  <UserChangeEmail user_id={user_id} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>
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
      <UserChangePassword user_id={user_id} />
    </Stack>
  );
}
export default UserEditBiodata;
