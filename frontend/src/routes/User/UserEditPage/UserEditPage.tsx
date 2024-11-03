import { Save } from "@mui/icons-material";
import { Button, Paper, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useLocation, useParams } from "wouter";
import { APIError } from "../../../helpers/fetch.ts";
import { useUsersDetailGet, useUsersDetailUpdate } from "../../../queries/user_hooks.ts";
import UserEditAboutMe from "./UserEditAboutMe.tsx";
import UserEditBiodata from "./UserEditBiodata.tsx";
import UserEditImage from "./UserEditImage.tsx";
import UserEditSocials from "./UserEditSocials.tsx";

function UserEdit(props: { user_id: number }) {
  const { user_id } = props;
  const { mutate: editUser } = useUsersDetailUpdate({
    user_id,
  });

  const handleUpdateClick = () => {
    editUser({
      // user_name: userName,
      // user_email: userEmail,
      // user_education_level: handleOptionalStringUpdate(userEducationLevel),
      // user_school: handleOptionalStringUpdate(userSchool),
      // user_about_me: handleOptionalStringUpdate(userAboutMe),
      // user_image: handleOptionalStringUpdate(userImage),
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          lg: 4,
        }}
      >
        <UserEditImage user_id={user_id} />
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 8,
        }}
      >
        <Paper
          sx={{
            px: 4,
            py: 2,
          }}
        >
          <UserEditBiodata user_id={user_id} />
        </Paper>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 4,
        }}
      >
        <Paper
          sx={{
            px: 4,
            py: 2,
          }}
        >
          <UserEditSocials user_id={user_id} />
        </Paper>
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 8,
        }}
      >
        <Paper
          sx={{
            px: 4,
            py: 2,
            height: "100%",
          }}
        >
          <UserEditAboutMe user_id={user_id} />
        </Paper>
      </Grid>
      <Grid size={12}>
        <Button fullWidth endIcon={<Save />} variant="contained" onClick={handleUpdateClick}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function UserAccountPageEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const user_id = Number(id);

  const { data } = useUsersDetailGet({
    user_id,
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status == 404) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });

  if (!data) {
    return <Skeleton />;
  }

  return <UserEdit user_id={user_id} />;
}

export default UserAccountPageEdit;
