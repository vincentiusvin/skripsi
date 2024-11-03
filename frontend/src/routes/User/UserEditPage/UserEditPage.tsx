import {
  Add,
  AddAPhoto,
  Edit,
  Key,
  Remove,
  Save,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
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
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import ImageDropzone from "../../../components/Dropzone.tsx";
import avatarFallback from "../../../helpers/avatar_fallback.tsx";
import { APIError } from "../../../helpers/fetch.ts";
import { fileToBase64DataURL } from "../../../helpers/file.ts";
import { LinkIcons, linkParser } from "../../../helpers/linker.tsx";
import { useList } from "../../../helpers/misc.ts";
import { useUsersDetailGet, useUsersDetailUpdate } from "../../../queries/user_hooks.ts";

function UserEditSocials(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useUsersDetailGet({
    user_id,
  });

  if (data == undefined) {
    return <Skeleton />;
  }
  return <UserEditSocialsLoaded social_medias={data.user_socials.map((x) => x.social)} />;
}

function UserEditSocialsLoaded(props: { social_medias: string[] }) {
  const { social_medias } = props;
  const [socials, { removeAt, push, updateAt }] = useList<string>(social_medias);

  return (
    <Stack spacing={2}>
      <Stack direction={"row"} alignItems={"center"}>
        <Typography variant="h6" fontWeight={"bold"} flexGrow={1}>
          Akun media sosial
        </Typography>
        <IconButton onClick={() => push("")}>
          <Add />
        </IconButton>
      </Stack>
      {socials.map((x, i) => {
        const try_parse = linkParser(x);
        return (
          <Stack key={i} direction="row" alignItems={"center"}>
            <TextField
              label={try_parse !== "Other" ? try_parse : "Link"}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">{LinkIcons[try_parse]}</InputAdornment>
                  ),
                },
              }}
              value={x}
              onChange={(e) => {
                updateAt(i, e.target.value);
              }}
            />
            <IconButton
              onClick={() => {
                removeAt(i);
              }}
            >
              <Remove />
            </IconButton>
          </Stack>
        );
      })}
    </Stack>
  );
}

function UserBiodata(props: { user_id: number }) {
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

function UserResetPassword(props: { user_id: number }) {
  const { user_id } = props;
  const [userPassword, setUserPassword] = useState<string | undefined>(undefined);
  const [userConfirmPassword, setUserConfirmPassword] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: editUser } = useUsersDetailUpdate({
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Password baru berhasil disimpan!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      reset();
    },
  });

  function updatePassword() {
    if (userPassword !== userConfirmPassword) {
      enqueueSnackbar({
        message: <Typography>Password anda tidak sesuai!</Typography>,
        autoHideDuration: 5000,
        variant: "error",
      });
      return;
    }

    editUser({
      user_password: userPassword,
    });
  }

  function reset() {
    setUserConfirmPassword(undefined);
    setUserPassword(undefined);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setDialogOpen(false);
  }

  return (
    <>
      <Dialog open={dialogOpen} onClose={() => reset()}>
        <DialogTitle> Ubah Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              type={showPassword ? "text" : "password"}
              value={userPassword ?? ""}
              onChange={(e) => setUserPassword(e.target.value)}
              variant="standard"
              label="Password"
              fullWidth
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((show) => !show)}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              required
              label="Ketik Ulang Password"
              fullWidth
              value={userConfirmPassword ?? ""}
              onChange={(e) => setUserConfirmPassword(e.target.value)}
              type={showConfirmPassword ? "text" : "password"}
              variant="standard"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword((show) => !show)}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button variant="contained" onClick={updatePassword}>
              Simpan
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <Button
        onClick={() => {
          setDialogOpen(true);
        }}
        variant="outlined"
        startIcon={<Key />}
      >
        Ganti Password
      </Button>
    </>
  );
}

function UserImageEdit(props: { user_id: number }) {
  const { user_id } = props;
  const { data } = useUsersDetailGet({
    user_id,
  });
  const [userImage, setUserImage] = useState<string | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  if (data == undefined) {
    return <Skeleton />;
  }

  const old_image =
    data.user_image ?? avatarFallback({ label: data.user_name, seed: data.user_id });

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
                src={userImage ?? old_image}
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
                <Typography textAlign={"center"}>
                  Tarik atau tekan di sini untuk mengupload gambar!
                </Typography>
              </Stack>
            )}
          </ImageDropzone>
        </DialogContent>
      </Dialog>
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
          <Avatar src={userImage ?? old_image} sx={{ width: 256, height: 256 }}></Avatar>
        </Badge>
      </Stack>
    </>
  );
}

function UserAboutMeEdit(props: { user_id: number }) {
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
        <UserImageEdit user_id={user_id} />
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
          <UserBiodata user_id={user_id} />
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
          <UserAboutMeEdit user_id={user_id} />
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
