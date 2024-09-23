import { AddAPhoto, Edit, Save, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { useLocation, useParams } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import { APIError } from "../../helpers/fetch";
import { fileToBase64DataURL } from "../../helpers/file";
import { useUsersDetailGet, useUsersDetailUpdate } from "../../queries/user_hooks";

function UserAccountPageEdit() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userPassword, setUserPassword] = useState<string | undefined>(undefined);
  const [userConfirmPassword, setUserConfirmPassword] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [userEducationLevel, setUserEducationLevel] = useState<string | undefined>(undefined);
  const [userSchool, setUserSchool] = useState<string | undefined>(undefined);
  const [userAboutMe, setUserAboutMe] = useState<string | undefined>(undefined);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const { data } = useUsersDetailGet({
    user_id: Number(id),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status == 404) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });

  const { mutate: editUser } = useUsersDetailUpdate({
    user_id: Number(id),
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Update Successful !</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation(`/users/${id}`);
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleUpdateClick = () => {
    if (userPassword !== userConfirmPassword) {
      enqueueSnackbar({
        message: <Typography>Password do not match !</Typography>,
        autoHideDuration: 5000,
        variant: "error",
      });
      return;
    }

    editUser({
      user_name: userName,
      user_password: userPassword,
      user_email: userEmail,
      user_education_level: userEducationLevel,
      user_school: userSchool,
      user_about_me: userAboutMe,
      user_image: userImage,
    });
  };

  if (data) {
    return (
      <>
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
          <DialogTitle>Add Image</DialogTitle>
          <DialogContent>
            <ImageDropzone
              sx={{
                cursor: "pointer",
              }}
              onChange={async (file) => {
                const b64 = file ? await fileToBase64DataURL(file) : undefined;
                setUserImage(b64);
                setModalOpen(false);
              }}
            >
              {userImage ? (
                <Avatar
                  src={userImage || (data.user_image ?? "")}
                  variant="rounded"
                  sx={{
                    width: "100%",
                    height: "100%",
                  }}
                ></Avatar>
              ) : (
                <Stack
                  alignItems={"center"}
                  minHeight={250}
                  justifyContent={"center"}
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  <AddAPhoto
                    sx={{
                      width: 100,
                      height: 100,
                    }}
                  />
                  <Typography>Drag and Drop or Click to upload an image!</Typography>
                </Stack>
              )}
            </ImageDropzone>
          </DialogContent>
        </Dialog>
        <Grid container rowGap={2}>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Stack alignItems={"center"}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Button
                    variant="contained"
                    onClick={() => {
                      setModalOpen(true);
                    }}
                  >
                    <Edit />
                  </Button>
                }
              >
                <Avatar
                  src={userImage || (data.user_image ?? "")}
                  sx={{ width: 256, height: 256 }}
                ></Avatar>
              </Badge>
            </Stack>
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Stack gap={4}>
              <Paper
                sx={{
                  px: 4,
                  py: 2,
                }}
              >
                <TextField
                  label="Username"
                  required
                  id="filled-required"
                  variant="standard"
                  defaultValue={data.user_name}
                  onChange={(e) => setUserName(e.target.value)}
                  fullWidth
                />
                <TextField
                  type={showPassword ? "text" : "password"}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  variant="standard"
                  label="Password"
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  required
                  label="Confirm Password"
                  fullWidth
                  onChange={(e) => setUserConfirmPassword(e.target.value)}
                  type="password"
                  variant="standard"
                />
                <TextField
                  required
                  label="Email"
                  variant="standard"
                  fullWidth
                  onChange={(e) => setUserEmail(e.target.value)}
                  defaultValue={data.user_email}
                />
                <TextField
                  label="Education Level"
                  fullWidth
                  variant="standard"
                  onChange={(e) => setUserEducationLevel(e.target.value)}
                  defaultValue={data.user_education_level}
                />
                <TextField
                  label="School"
                  fullWidth
                  variant="standard"
                  onChange={(e) => setUserSchool(e.target.value)}
                  defaultValue={data.user_school}
                />
              </Paper>

              <Paper
                sx={{
                  px: 4,
                  py: 2,
                }}
              >
                <TextField
                  label="About Me"
                  variant="standard"
                  fullWidth
                  onChange={(e) => setUserAboutMe(e.target.value)}
                  defaultValue={data.user_about_me}
                />
              </Paper>
              <Button endIcon={<Save />} variant="contained" onClick={handleUpdateClick}>
                Simpan
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default UserAccountPageEdit;
