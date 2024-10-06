import { Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import { useReportsPost } from "../../queries/report_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

function UserReportAdd() {
  const [, navigate] = useLocation();
  const { mutate: addReport } = useReportsPost({
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Laporan berhasil dibuat!</Typography>,
      });
      navigate("/reports");
    },
  });
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <Grid container>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
        textAlign={"center"}
        padding={2}
        alignContent={"center"}
      >
        <Typography variant="h6" marginBottom={2}>
          Buat Laporan
        </Typography>
        <Typography variant="body1">
          Anda dapat melaporkan penyalahgunaan aplikasi yang anda temukan di sini.
        </Typography>
        <Typography variant="body1">
          Laporan anda akan ditinjau dan ditindaklanjuti oleh pengelola website.
        </Typography>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Stack spacing={2}>
          <TextField
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            label="Judul Laporan"
          ></TextField>
          <TextField
            value={desc}
            onChange={(e) => {
              setDesc(e.target.value);
            }}
            label="Informasi Tambahan"
            multiline
            minRows={3}
          ></TextField>
          <Button
            variant="contained"
            onClick={() => {
              addReport({
                title: title,
                description: desc,
              });
            }}
          >
            Kirim
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}

function UserReportAddPage() {
  const { data: sessionData } = useSessionGet();

  if (!sessionData) {
    return <Skeleton />;
  }

  if (sessionData.logged === false) {
    return <Redirect to={"/"} />;
  } else {
    return <UserReportAdd />;
  }
}
export default UserReportAddPage;
