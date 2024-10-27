import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useParams } from "wouter";
import { useOrgsDetailMembersDelete } from "../../queries/org_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import AuthorizeOrgs, { RedirectBack } from "./components/AuthorizeOrgs.tsx";

function OrgLeave(props: { org_id: number; user_id: number }) {
  const { org_id, user_id } = props;

  const { mutate: leaveOrg } = useOrgsDetailMembersDelete({
    org_id,
    user_id,
    onSuccess: () => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>Berhasil meninggalkan organisasi!</Typography>,
      });
    },
  });
  return (
    <Stack
      direction={"column"}
      justifyContent={"center"}
      minHeight={"inherit"}
      padding={16}
      textAlign={"center"}
      spacing={8}
      margin={"auto"}
    >
      <Box>
        <Typography variant="h5">Apakah anda yakin ingin meninggalkan organisasi ini?</Typography>
        <Typography variant="body1">
          Anda tidak dapat lagi mengelola proyek-proyek yang dijalankan, tetapi anda masih dapat
          bergabung sebagai Developer dalam proyek-proyek organisasi ini.
        </Typography>
      </Box>
      <Button color="error" variant="contained" onClick={() => leaveOrg()}>
        Keluar
      </Button>
    </Stack>
  );
}

function OrgsLeavePage() {
  const { org_id: id } = useParams();
  const org_id = Number(id);
  const { data: sessionData } = useSessionGet();

  if (!sessionData) {
    return <Skeleton />;
  }

  if (!sessionData.logged) {
    return <RedirectBack />;
  }

  return (
    <AuthorizeOrgs allowedRoles={["Admin"]}>
      <OrgLeave user_id={sessionData.user_id} org_id={org_id} />
    </AuthorizeOrgs>
  );
}

export default OrgsLeavePage;
