import {
  Button,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useParams } from "wouter";
import StyledLink from "../../components/StyledLink.tsx";
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
      <Typography textAlign={"center"} variant="h6">
        Kontribusi Terbaru
      </Typography>
      <StyledLink to={`/projects/${project_id}/add-contribs`}>
        <Button fullWidth variant="contained">
          Tambah Kontribusi
        </Button>
      </StyledLink>
      {contributions.map((x) => (
        <ListItem key={x.id}>
          <ListItemButton>
            <ListItemText
              primary={x.name}
              secondary={dayjs(x.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
            />
            <ListItemIcon>
              <Stack direction="row" spacing={2}>
                {x.contribution_users.map((y) => (
                  <UserLabel user_id={y.user_id} key={y.user_id} />
                ))}
              </Stack>
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
