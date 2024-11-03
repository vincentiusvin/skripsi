import { Save } from "@mui/icons-material";
import { Button, Paper, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useLocation, useParams } from "wouter";
import { APIError } from "../../../helpers/fetch.ts";
import { handleOptionalStringUpdate } from "../../../helpers/misc.ts";
import { useUsersDetailGet, useUsersDetailUpdate } from "../../../queries/user_hooks.ts";
import UserEditAboutMe from "./UserEditAboutMe.tsx";
import UserEditBiodata from "./UserEditBiodata.tsx";
import UserEditImage from "./UserEditImage.tsx";
import UserEditSocials from "./UserEditSocials.tsx";
import { UserEditContext, useUserEditState } from "./context.tsx";

function UserEdit(props: { user_id: number }) {
  const { user_id } = props;
  const { mutate: editUser } = useUsersDetailUpdate({
    user_id,
  });

  const [userUpdate, setUserUpdate] = useUserEditState();

  const handleUpdateClick = () => {
    editUser({
      user_name: userUpdate.user_name,
      user_email: userUpdate.user_email,
      user_education_level: handleOptionalStringUpdate(userUpdate.user_education_level),
      user_school: handleOptionalStringUpdate(userUpdate.user_school),
      user_about_me: handleOptionalStringUpdate(userUpdate.user_about_me),
      user_image: handleOptionalStringUpdate(userUpdate.user_image),
      user_socials: userUpdate.user_socials,
    });
  };

  return (
    <UserEditContext.Provider value={[userUpdate, setUserUpdate]}>
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
    </UserEditContext.Provider>
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
