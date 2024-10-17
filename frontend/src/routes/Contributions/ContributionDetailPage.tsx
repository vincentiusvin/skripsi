import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from "@mui/lab";
import { Button, Divider, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import { useParams } from "wouter";
import ProjectCard from "../../components/Cards/ProjectCard.tsx";
import StyledLink from "../../components/StyledLink.tsx";
import UserLabel from "../../components/UserLabel.tsx";
import {
  useContributionsDetailGet,
  useContributionsDetailPut,
} from "../../queries/contribution_hooks.ts";

function ContributionApproval(props: { contribution_id: number }) {
  const { contribution_id } = props;
  const { mutate: update } = useContributionsDetailPut({
    contribution_id,
  });

  return (
    <>
      <Typography variant="h6" fontWeight={"bold"}>
        Persetujuan
      </Typography>
      <Typography variant="caption">
        Pengguna dapat membuat laporan kontribusi yang ditampilkan di profil mereka secara publik.
      </Typography>
      <Typography variant="caption">
        Sebagai pengurus organisasi, anda dapat menyetujui, menolak, atau meminta revisi laporan
        kontribusi ini.
      </Typography>
      <Typography variant="caption">
        Penolakan hanya diizinkan apabila laporan ini mengandung informasi yang tidak benar atau
        informasi yang sensitif.
      </Typography>
      <Button
        variant="contained"
        onClick={() => {
          update({
            status: "Approved",
          });
        }}
      >
        Setuju
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          update({
            status: "Deny",
          });
        }}
      >
        Tolak
      </Button>
      <Button
        variant="contained"
        onClick={() => {
          update({
            status: "Revision",
          });
        }}
      >
        Minta Revisi
      </Button>
    </>
  );
}

function ContributionStatus() {
  const steps = [
    {
      title: "Dikumpul oleh developer.",
      desc: "Laporan kontribusi dibuat dan diisi oleh developer.",
      stat: "pass",
    },
    {
      title: "Menunggu persetujuan organisasi",
      desc: "Bukti kontribusi perlu disetujui terlebih dahulu oleh pengurus organisasi",
      stat: "here",
    },
    {
      title: "Disetujui",
      desc: "Bukti kontribusi sudah disetujui oleh pengurus organisasi dan dapat dilihat secara publik.",
      stat: "no",
    },
  ];
  return (
    <>
      <Typography variant="h6" fontWeight={"bold"}>
        Status
      </Typography>
      <Timeline
        sx={{
          [`*.${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {steps.map((x, i) => (
          <TimelineItem key={i}>
            <TimelineSeparator>
              <TimelineDot
                color={x.stat === "pass" ? "success" : x.stat === "here" ? "warning" : undefined}
              />
              {i !== steps.length - 1 ? <TimelineConnector /> : null}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1">
                {x.title}
                {x.stat === "here" ? " (anda di sini)" : null}
              </Typography>
              <Typography variant="caption">{x.desc}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </>
  );
}

function ContributionDetail(props: { contribution_id: number }) {
  const { contribution_id } = props;
  const { data: contrib } = useContributionsDetailGet({
    contribution_id,
  });

  if (!contrib) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={2}>
      <Grid
        size={{
          xs: 12,
          sm: 9,
        }}
      >
        <Typography variant="h4" textAlign="center" fontWeight={"bold"}>
          {contrib.name}
        </Typography>
        <Typography variant="caption" textAlign="center" display="block">
          {dayjs(contrib.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
        </Typography>
        <Divider
          sx={{
            marginY: 2,
          }}
        />
        <Typography textAlign="center">{contrib.description}</Typography>
      </Grid>
      <Grid
        size={{
          xs: 12,
          sm: 3,
        }}
      >
        <Stack spacing={2}>
          <StyledLink to={`/contribs/${contribution_id}/edit`}>
            <Button fullWidth variant="contained">
              Edit
            </Button>
          </StyledLink>
          <Divider />
          <ContributionApproval contribution_id={contribution_id} />
          <Divider />
          <Typography variant="h6" fontWeight={"bold"}>
            Kontributor
          </Typography>
          {contrib.contribution_users.map((x) => (
            <StyledLink to={`/users/${x.user_id}`} key={x.user_id}>
              <UserLabel user_id={x.user_id} />
            </StyledLink>
          ))}
          <Divider />
          <Typography variant="h6" fontWeight={"bold"}>
            Proyek
          </Typography>
          <ProjectCard project_id={contrib.project_id} />
          <Divider />
          <ContributionStatus />
        </Stack>
      </Grid>
    </Grid>
  );
}

function ContributionDetailPage() {
  const { contribution_id: id } = useParams();
  const contribution_id = Number(id);

  return <ContributionDetail contribution_id={contribution_id} />;
}

export default ContributionDetailPage;
