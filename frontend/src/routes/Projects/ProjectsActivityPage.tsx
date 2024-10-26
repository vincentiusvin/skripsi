import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { Box, Skeleton, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "wouter";
import { useProjectsDetailEventsGet } from "../../queries/project_hooks.ts";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";

function ProjectTimeline(props: { project_id: number }) {
  const { project_id } = props;
  const { data: events } = useProjectsDetailEventsGet({ project_id });

  if (events == undefined) {
    return <Skeleton />;
  }

  const reversed = [...events].reverse();

  return (
    <Box>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"} marginBottom={2}>
        Aktivitas
      </Typography>
      {reversed.length !== 0 ? (
        <Timeline>
          {reversed.map((x, i) => {
            const time = dayjs(x.created_at);
            const is_last = i === events.length - 1;

            return (
              <TimelineItem key={x.id}>
                <TimelineOppositeContent>
                  <Typography>{time.format("ddd[,] D[/]M[/]YY")}</Typography>
                  <Typography>{time.format("HH:mm")}</Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot />
                  {is_last ? null : <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>{x.event}</TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      ) : (
        <Typography textAlign={"center"}>Proyek ini belum memiliki aktivitas</Typography>
      )}
    </Box>
  );
}

function ProjectsActivityPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin"]}>
      <ProjectTimeline project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsActivityPage;
