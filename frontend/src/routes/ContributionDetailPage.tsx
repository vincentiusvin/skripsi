import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from "@mui/lab";
import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import { useParams } from "wouter";
import ProjectCard from "../components/Cards/ProjectCard.tsx";
import StyledLink from "../components/StyledLink.tsx";
import UserLabel from "../components/UserLabel.tsx";
import { useContributionsDetailGet } from "../queries/contribution_hooks.ts";

function ContributionApproval() {
  const steps = [
    {
      title: "Dikumpul oleh developer.",
      desc: "Bukti kontribusi dibuat dan diisi oleh developer.",
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
      <Divider />
      <Typography variant="h6" fontWeight={"bold"}>
        Persetujuan
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
          <ContributionApproval />
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
