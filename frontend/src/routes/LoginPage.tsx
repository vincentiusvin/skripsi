import { Avatar, Box, Button, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import charityImg from "../assets/help.png";
import StyledLink from "../components/StyledLink.tsx";
import { useSessionGet, useSessionPut } from "../queries/sesssion_hooks";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [, setLocation] = useLocation();

  const { mutate: putSession } = useSessionPut({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Berhasil masuk!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/");
    },
  });

  function login() {
    putSession({
      user_name: username,
      user_password: password,
    });
  }

  return (
    <Grid
      container
      minHeight={"inherit"}
      alignItems={"center"}
      paddingX={{ xs: 2, md: 8 }}
      columnSpacing={{ xs: 2, lg: 4 }}
      rowSpacing={2}
    >
      <Grid
        size={{
          xs: 12,
          md: 5,
        }}
      >
        <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
          Dev4You
        </Typography>
        <Avatar
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
            margin: "auto",
            width: "75%",
            height: "100%",
          }}
          variant="square"
          src={charityImg}
        ></Avatar>
      </Grid>
      <Grid size={{ md: 7, xs: 12 }}>
        <Box width="fit-content" margin="auto">
          <Paper
            sx={{
              paddingX: 4,
              paddingY: 8,
            }}
          >
            <Stack spacing={4}>
              <Typography variant="h5" fontWeight={"bold"} textAlign={"center"}>
                Masuk
              </Typography>
              <TextField
                fullWidth
                onChange={(e) => setUsername(e.target.value)}
                label="Username"
                sx={{ display: "block" }}
              ></TextField>
              <TextField
                fullWidth
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                sx={{ display: "block" }}
              ></TextField>
              <Button variant="contained" size="large" fullWidth onClick={() => login()}>
                Masuk
              </Button>
              <Stack spacing={1} alignItems={"center"}>
                <Stack direction="row" spacing={2} alignItems={"center"} justifyContent={"center"}>
                  <Typography>Tidak memiliki akun?</Typography>
                  <StyledLink to="/register">
                    <Button>Daftar</Button>
                  </StyledLink>
                </Stack>
                <StyledLink to={"/reset-password"}>
                  <Button>Lupa Password</Button>
                </StyledLink>
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
}

function LoginPage() {
  const { data: session } = useSessionGet();
  if (session == undefined) {
    return <Skeleton />;
  }
  if (session.logged) {
    return <Redirect to={"/"} />;
  }
  return <Login />;
}

export default LoginPage;
