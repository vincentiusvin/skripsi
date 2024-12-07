import { Save } from "@mui/icons-material";
import { Button, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useLocation, useParams } from "wouter";
import { parseURL } from "../../../helpers/linker.tsx";
import { handleOptionalStringUpdate } from "../../../helpers/misc.ts";
import { useUsersDetailUpdate } from "../../../queries/user_hooks.ts";
import AuthorizeUser from "../AuthorizeUser.tsx";
import UserEditAboutMe from "./UserEditAboutMe.tsx";
import UserEditBiodata from "./UserEditBiodata.tsx";
import UserEditImage from "./UserEditImage.tsx";
import UserEditSocials from "./UserEditSocials.tsx";
import { UserEditContext, useUserEditState } from "./context.tsx";

function UserEdit(props: { user_id: number }) {
  const { user_id } = props;
  const [, setLocation] = useLocation();
  const { mutate: editUser } = useUsersDetailUpdate({
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Berhasil mengupdate profile!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation(`/users/${user_id}`);
    },
  });

  const [userUpdate, setUserUpdate] = useUserEditState();

  const handleUpdateClick = () => {
    let websiteCleaned = handleOptionalStringUpdate(userUpdate.user_website);
    if (userUpdate.user_website != undefined) {
      try {
        websiteCleaned = parseURL(websiteCleaned ?? "").href;
      } catch (e) {
        e;
      }
    }

    let socialsCleaned = userUpdate.user_socials;
    if (socialsCleaned != undefined) {
      socialsCleaned = socialsCleaned
        .filter((x) => x.length !== 0)
        .map((x) => {
          try {
            return parseURL(x).href;
          } catch (e) {
            return x;
          }
        });
    }

    editUser({
      user_name: userUpdate.user_name,
      user_education_level: handleOptionalStringUpdate(userUpdate.user_education_level),
      user_school: handleOptionalStringUpdate(userUpdate.user_school),
      user_website: websiteCleaned,
      user_about_me: handleOptionalStringUpdate(userUpdate.user_about_me),
      user_image: handleOptionalStringUpdate(userUpdate.user_image),
      user_socials: socialsCleaned,
      user_location: handleOptionalStringUpdate(userUpdate.user_location),
      user_workplace: handleOptionalStringUpdate(userUpdate.user_workplace),
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
  const user_id = Number(id);

  return (
    <AuthorizeUser self={true}>
      <UserEdit user_id={user_id} />
    </AuthorizeUser>
  );
}

export default UserAccountPageEdit;
