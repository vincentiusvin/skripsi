import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from "@mui/lab";
import { Button, Divider, Stack, Typography } from "@mui/material";
import StyledLink from "../../../components/StyledLink.tsx";
import { useContributionsDetailPut } from "../../../queries/contribution_hooks.ts";
import { useProjectsDetailMembersGet } from "../../../queries/project_hooks.ts";

function ContributionInvolved(props: {
  user_id: number;
  project_id: number;
  contribution_id: number;
  contribution_users: number[];
  status: "Pending" | "Approved" | "Revision" | "Rejected";
}) {
  const { user_id, project_id, contribution_users, contribution_id, status } = props;
  const { data: project_role } = useProjectsDetailMembersGet({
    project_id,
    user_id,
  });

  const is_author: boolean = contribution_users.includes(user_id);
  const is_admin: boolean = project_role?.role === "Admin";

  return (
    <Stack spacing={2} divider={<Divider />}>
      {is_author ? (
        <StyledLink to={`/contributions/${contribution_id}/edit`}>
          <Button fullWidth variant="contained">
            Edit
          </Button>
        </StyledLink>
      ) : null}
      {is_author || is_admin ? <ContributionStatus status={status} /> : null}
      {is_admin && !is_author && status === "Pending" ? (
        <ContributionApproval contribution_id={contribution_id} />
      ) : null}
    </Stack>
  );
}

function ContributionApproval(props: { contribution_id: number }) {
  const { contribution_id } = props;
  const { mutate: update } = useContributionsDetailPut({
    contribution_id,
  });

  return (
    <Stack spacing={2}>
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
        informasi yang rahasia.
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
            status: "Rejected",
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
    </Stack>
  );
}

function ContributionStatus(props: { status: "Pending" | "Approved" | "Revision" | "Rejected" }) {
  const { status } = props;
  const steps: {
    title: string;
    desc: string;
    color: "success" | "warning" | "error";
  }[] = [
    {
      title: "Dikumpul oleh developer.",
      desc: "Laporan kontribusi dibuat dan diisi oleh developer.",
      color: "success",
    },
    {
      title: "Menunggu persetujuan organisasi",
      desc: "Bukti kontribusi perlu disetujui terlebih dahulu oleh pengurus organisasi",
      color: status === "Pending" ? "warning" : "success",
    },
  ];

  if (status === "Approved") {
    steps.push({
      title: "Disetujui",
      desc: "Bukti kontribusi sudah disetujui oleh pengurus organisasi dan dapat dilihat secara publik.",
      color: "success",
    });
  } else if (status === "Rejected") {
    steps.push({
      title: "Ditolak",
      desc: "Bukti kontribusi anda ditolak oleh pengurus organisasi. Penolakan dapat terjadi apabila laporan mengandung informasi yang tidak benar ataupun rahasia.",
      color: "error",
    });
  } else if (status === "Revision") {
    steps.push({
      title: "Revisi",
      desc: "Pengurus organisasi meminta revisi laporan ini.",
      color: "warning",
    });
  }

  return (
    <Stack spacing={2}>
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
              <TimelineDot color={x.color} />
              {i !== steps.length - 1 ? <TimelineConnector /> : null}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1">{x.title}</Typography>
              <Typography variant="caption">{x.desc}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Stack>
  );
}
export default ContributionInvolved;
