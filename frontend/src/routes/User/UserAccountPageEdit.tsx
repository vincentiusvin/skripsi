import { AddAPhoto, ArrowBack, Edit, Update, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import React, { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import { APIError } from "../../helpers/fetch";
import { fileToBase64DataURL } from "../../helpers/file";
import { useUserAccountDetailGet, useUserAccountDetailUpdate } from "../../queries/user_hooks";

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

  const { data } = useUserAccountDetailGet({
    user_id: Number(id),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status == 404) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
  });

  const { mutate: editUser } = useUserAccountDetailUpdate({
    user_id: Number(id),
    name: userName,
    password: userPassword,
    email: userEmail,
    educationLevel: userEducationLevel,
    school: userSchool,
    about_me: userAboutMe,
    image: userImage,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Update Successful !</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation(`/users/${id}`);
    },
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleUpdateClick = () => {
    if (userPassword !== userConfirmPassword) {
      throw new Error("password not match");
    }
    editUser();
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
        <Grid container mt={2}>
          <Grid item xs={1}>
            <Link to={`/users/${id}`}>
              <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
                Go Back
              </Button>
            </Link>
          </Grid>
          <Grid item xs paddingTop="10vw">
            <Grid item xs={2} md={1}>
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
                  sx={{ width: "20vw", height: "20vw" }}
                ></Avatar>
              </Badge>
            </Grid>
            <Grid item xs>
              <Typography variant="h2" color="#6A81FC">
                <Link
                  to={`/user/${data.user_id}/account`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Account
                </Link>
              </Typography>
              <Typography variant="h2">
                <Link
                  to={`/user/${data.user_id}/contribution`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Contribution
                </Link>
              </Typography>
              <Typography variant="h2">
                <Link to={"/"} style={{ textDecoration: "none", color: "inherit" }}>
                  Connections
                </Link>
              </Typography>
            </Grid>
          </Grid>
          <Grid item paddingTop="10vw" paddingRight="20vw">
            <Paper
              sx={{
                p: 2,
                margin: "auto",
                maxWidth: 500,
                flexGrow: 1,
                backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
              }}
            >
              <Grid item>
                <Typography variant="button">Username:</Typography>
                <br />
                <TextField
                  required
                  id="filled-required"
                  variant="standard"
                  defaultValue={data.user_name}
                  onChange={(e) => setUserName(e.target.value)}
                  sx={{ width: "25vw" }}
                />
              </Grid>
              <Grid item>
                <Typography variant="button">Password:</Typography>
                <br />
                {/* <TextField
                  required
                  label="Required"
                  type="password"
                  variant="standard"
                  onChange={(e) => setUserPassword(e.target.value)}
                  sx={{ width: "25vw" }}
                /> */}
                <FormControl sx={{ width: "25vw" }} variant="standard">
                  <Input
                    id="standard-adornment-password"
                    type={showPassword ? "text" : "password"}
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Grid>
              <Grid item>
                <Typography variant="button">Confirm Password:</Typography>
                <br />
                <TextField
                  required
                  id="filled-password-input"
                  label="Required"
                  onChange={(e) => setUserConfirmPassword(e.target.value)}
                  type="password"
                  variant="standard"
                  sx={{ width: "25vw" }}
                />
              </Grid>
              <Grid item>
                <Typography variant="button">Email:</Typography>
                <br />
                <TextField
                  required
                  id="outlined_required"
                  label="Required"
                  variant="standard"
                  onChange={(e) => setUserEmail(e.target.value)}
                  defaultValue={data.user_email}
                  sx={{ width: "25vw" }}
                />
              </Grid>
              <Grid item>
                <Typography variant="button">Education-level:</Typography>
                <br />
                <TextField
                  variant="standard"
                  onChange={(e) => setUserEducationLevel(e.target.value)}
                  defaultValue={data.user_education_level}
                  sx={{ width: "25vw" }}
                />
              </Grid>
              <Grid item>
                <Typography variant="button">School:</Typography>
                <br />
                <TextField
                  variant="standard"
                  onChange={(e) => setUserSchool(e.target.value)}
                  defaultValue={data.user_school}
                  sx={{ width: "25vw" }}
                />
              </Grid>
            </Paper>

            <Paper
              sx={{
                p: 2,
                margin: "auto",
                maxWidth: 500,
                flexGrow: 1,
                backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#1A2027" : "#fff"),
                marginTop: "2vw",
              }}
            >
              <Grid item>
                <Typography variant="button">About Me</Typography>
                <br />
                <TextField
                  variant="standard"
                  onChange={(e) => setUserAboutMe(e.target.value)}
                  defaultValue={data.user_about_me}
                  sx={{ width: "25vw" }}
                />
              </Grid>
            </Paper>

            <Grid item xs={8} paddingTop="2vw">
              {/* <Button endIcon={<Update />} variant="contained" fullWidth onClick={() => editUser()}>
                Update
              </Button> */}
              <Button
                endIcon={<Update />}
                variant="contained"
                fullWidth
                onClick={handleUpdateClick}
              >
                Update
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </>
    );
  }
}

export default UserAccountPageEdit;
