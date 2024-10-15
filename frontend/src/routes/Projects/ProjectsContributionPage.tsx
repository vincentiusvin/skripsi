import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";
import { useParams } from "wouter";
import UserLabel from "../../components/UserLabel.tsx";
import { useContributionsGet } from "../../queries/contribution_hooks.ts";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";

function ProjectsContribution(props: { project_id: number }) {
  const { project_id } = props;
  const { data: contributions } = useContributionsGet({
    project_id,
  });

  if (contributions == undefined) {
    return <Skeleton />;
  }

  return (
    <Stack>
      {contributions.map((x) => (
        <ListItem key={x.id}>
          <ListItemButton>
            <ListItemText primary={x.name} secondary={x.description} />
            <ListItemIcon>
              {x.contribution_users.map((y) => (
                <UserLabel user_id={y.user_id} key={y.user_id} />
              ))}
            </ListItemIcon>
          </ListItemButton>
        </ListItem>
      ))}
    </Stack>
  );
}

function ProjectsContributionPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin", "Dev"]}>
      <ProjectsContribution project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsContributionPage;
