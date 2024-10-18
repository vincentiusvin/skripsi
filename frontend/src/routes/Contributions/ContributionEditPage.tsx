import { Save } from "@mui/icons-material";
import { Button, Skeleton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
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
      setLocation(`/contribs/${contribution_id}`);
    },
  });

  function updateData() {
    update({
      description: contributionDesc,
      name: contributionName,
      user_ids: contributionUsers,
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
      <Grid size={12}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            label="Judul"
            value={contributionName ?? contribs.name}
            onChange={(e) => setContributionName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Deskripsi"
            value={contributionDesc ?? contribs.description}
            onChange={(e) => setContributionDesc(e.target.value)}
            required
            multiline
            minRows={4}
          />
          <UserSelect
            label="Kontributor"
            allowed_users={[1, 2, 3]}
            onChange={(x) => {
              setContributionUsers(x);
            }}
            current_users={contributionUsers ?? contribs_users}
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
