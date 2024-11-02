import { Save } from "@mui/icons-material";
import { Alert, AlertTitle, Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import RichEditor from "../../components/RichEditor.tsx";
import UserSelect from "../../components/UserSelect.tsx";
import {
  useContributionsDetailGet,
  useContributionsDetailPut,
} from "../../queries/contribution_hooks.ts";

function ContributionEdit(props: { contribution_id: number }) {
  const { contribution_id } = props;

  const [contributionName, setContributionName] = useState<undefined | string>();
  const [contributionDesc, setContributionDesc] = useState<undefined | string>();
  const [contributionUsers, setContributionUsers] = useState<number[] | undefined>();
  const { data: contribs } = useContributionsDetailGet({
    contribution_id,
  });
  const [, setLocation] = useLocation();
  const { mutate: update } = useContributionsDetailPut({
    contribution_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Laporan kontribusi berhasil diubah!</Typography>,
      });
      setLocation(`/contributions/${contribution_id}`);
    },
  });

  function updateData() {
    update({
      description: contributionDesc,
      name: contributionName,
      user_ids: contributionUsers,
      status: "Pending",
    });
  }

  if (!contribs) {
    return <Skeleton />;
  }
  const contribs_users = contribs.user_ids.map((x) => x.user_id);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Edit Kontribusi
        </Typography>
      </Grid>
      {contribs.status === "Approved" ? (
        <Grid
          size={12}
          sx={{
            paddingBottom: 1,
          }}
        >
          <Alert severity="warning">
            <AlertTitle>Kontribusi ini sudah diterima!</AlertTitle>
            Laporan kontribusi anda sudah disetujui oleh pengurus organisasi.
            <br />
            Apabila anda ingin mengubah isi laporan ini, anda perlu mengulangi proses persetujuan.
          </Alert>
        </Grid>
      ) : null}
      <Grid size={12}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            label="Judul"
            value={contributionName ?? contribs.name}
            onChange={(e) => setContributionName(e.target.value)}
            required
          />
          <UserSelect
            label="Kontributor"
            allowed_users={[1, 2, 3]}
            onChange={(x) => {
              setContributionUsers(x);
            }}
            current_users={contributionUsers ?? contribs_users}
          />
          <RichEditor
            defaultValue={contributionDesc ?? contribs.description}
            onBlur={(x) => setContributionDesc(x)}
          />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => updateData()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function ContributionEditPage() {
  const { contribution_id: id } = useParams();
  const contribution_id = Number(id);
  return <ContributionEdit contribution_id={contribution_id} />;
}

export default ContributionEditPage;
