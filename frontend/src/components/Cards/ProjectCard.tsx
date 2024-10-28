import { Code, Shield } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useOrgDetailGet } from "../../queries/org_hooks.ts";
import { useProjectsDetailMembersGet } from "../../queries/project_hooks";
import { useProjectsDetailGet } from "../../queries/project_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import StyledLink from "../StyledLink.tsx";

function RoleInfo(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { data: role_data } = useProjectsDetailMembersGet({
    project_id,
    user_id,
  });

  return role_data?.role === "Admin" ? (
    <Tooltip title="Tergabung sebagai administrator">
      <Shield />
    </Tooltip>
  ) : role_data?.role === "Dev" ? (
    <Tooltip title="Tergabung sebagai developer">
      <Code />
    </Tooltip>
  ) : null;
}

function OrgName(props: { org_id: number }) {
  const { org_id } = props;
  const { data: org_data } = useOrgDetailGet({
    id: org_id,
  });

  if (org_data == undefined) {
    return <Skeleton />;
  }

  return <Typography variant="body1">oleh {org_data.org_name}</Typography>;
}

function ProjectCard(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });
  const { data: session_data } = useSessionGet();

  if (project == undefined) {
    return <Skeleton />;
  }

  return (
    <StyledLink to={`/projects/${project.project_id}`}>
      <Card>
        <CardActionArea>
          <CardHeader
            title={
              <Typography variant="h5" fontWeight={"bold"}>
                {project.project_name}
              </Typography>
            }
            action={
              session_data?.logged ? (
                <RoleInfo project_id={project.project_id} user_id={session_data.user_id} />
              ) : null
            }
            subheader={<OrgName org_id={project.org_id} />}
          />
          <CardContent>
            <Stack spacing={2} direction="column">
              <Typography variant="body2">{project.project_desc}</Typography>
              <Divider />
              <Stack direction={"row"} gap={2} flexWrap={"wrap"}>
                {project.project_categories.map((category, index) => (
                  <Chip key={index} label={category.category_name} />
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    </StyledLink>
  );
}

export default ProjectCard;
