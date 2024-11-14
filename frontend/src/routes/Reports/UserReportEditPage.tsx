import { Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useReportsDetailGet, useReportsPut } from "../../queries/report_hooks.ts";
import AuthorizeReports from "./components/AuthorizeReports.tsx";

function UserReportEdit(props: { report_id: number }) {
  const { report_id } = props;
  const [, navigate] = useLocation();
  const { mutate: editReport } = useReportsPut({
    report_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Laporan berhasil diubah!</Typography>,
      });
      navigate(`/reports/${report_id}`);
    },
  });
  const { data: report } = useReportsDetailGet({
    report_id,
  });
  const [title, setTitle] = useState<string | undefined>();
  const [desc, setDesc] = useState<string | undefined>();

  if (!report) {
    return <Skeleton />;
  }

  return (
    <Stack spacing={2}>
      <TextField
        value={title ?? report.title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        required
        label="Judul Laporan"
      ></TextField>
      <TextField
        value={desc ?? report.description}
        onChange={(e) => {
          setDesc(e.target.value);
        }}
        label="Informasi Tambahan"
        multiline
        required
        minRows={3}
      ></TextField>
      <Button
        variant="contained"
        onClick={() => {
          editReport({
            title: title,
            description: desc,
          });
        }}
      >
        Kirim
      </Button>
    </Stack>
  );
}

function UserReportEditPage() {
  const { report_id: id } = useParams();
  const report_id = Number(id);

  return (
    <AuthorizeReports>
      <UserReportEdit report_id={report_id} />
    </AuthorizeReports>
  );
}
export default UserReportEditPage;
