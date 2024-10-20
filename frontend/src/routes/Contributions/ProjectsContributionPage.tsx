import { Add } from "@mui/icons-material";
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
import AuthorizeProjects from "../Projects/components/AuthorizeProjects.tsx";
import ContributionChip from "./components/ContributionChip.tsx";

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
        <Button fullWidth variant="contained" startIcon={<Add />}>
          Tambah Kontribusi
        </Button>
      </StyledLink>
      {contributions.map((contrib) => (
        <StyledLink to={`/contributions/${contrib.id}`} key={contrib.id}>
          <ListItem>
            <ListItemButton>
              <ListItemText
                primary={contrib.name}
                secondary={dayjs(contrib.created_at).format("ddd[,] D[/]M[/]YY HH:mm")}
              />
              <ListItemIcon>
                <Stack direction="row" spacing={2} alignItems={"center"}>
                  {contrib.user_ids.map((y) => (
                    <UserLabel user_id={y.user_id} key={y.user_id} />
                  ))}
                  <ContributionChip status={contrib.status} />
                </Stack>
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </StyledLink>
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
