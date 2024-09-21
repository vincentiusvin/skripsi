import { Code, SearchOutlined, Shield } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useDebounce } from "use-debounce";
import { API } from "../../../../backend/src/routes.ts";
import StyledLink from "../../components/StyledLink.tsx";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import { useOrgDetailGet } from "../../queries/org_hooks.ts";
import { useProjectsDetailMembersGet, useProjectsGet } from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

function RoleInfo(props: { project_id: number; user_id: number }) {
  const { project_id, user_id } = props;
  const { data: role_data } = useProjectsDetailMembersGet({
    project_id,
    user_id,
  });

  return role_data?.role === "Admin" ? (
    <Tooltip title="Joined as administrator">
      <Shield />
    </Tooltip>
  ) : role_data?.role === "Dev" ? (
    <Tooltip title="Joined as developer">
      <Code />
    </Tooltip>
  ) : null;
}

function ProjectCard(props: { project: API["ProjectsGet"]["ResBody"][number] }) {
  const { project } = props;
  const { data: org_data } = useOrgDetailGet({
    id: project.org_id,
  });
  const { data: session_data } = useSessionGet();

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
            subheader={<Typography variant="body1">by {org_data?.org_name}</Typography>}
          />
          <CardContent>
            <Typography variant="body2">{project.project_desc}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </StyledLink>
  );
}

function ProjectListPage() {
  const { data: session } = useSessionGet();

  const searchHook = useSearchParams();
  const [personal, setPersonal] = useStateSearch("personal", searchHook);
  const [keyword, setKeyword] = useStateSearch("keyword", searchHook);

  const [debouncedKeyword] = useDebounce(keyword, 250);

  const { data } = useProjectsGet({
    user_id: personal === "true" && session?.logged ? session.user_id : undefined,
    keyword:
      typeof debouncedKeyword === "string" && debouncedKeyword.length
        ? debouncedKeyword
        : undefined,
  });

  return (
    <Grid container spacing={2} mt={2}>
      <Grid
        size={{
          xs: 0,
          md: 3,
        }}
      />
      <Grid
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Tabs
          centered
          sx={{
            flexGrow: 1,
          }}
          value={personal === "true" ? "personal" : "all"}
          onChange={(_e, tab: "all" | "personal") => {
            if (tab === "personal") {
              setPersonal("true");
            } else {
              setPersonal(undefined);
            }
          }}
        >
          <Tab label={"All Projects"} value={"all"} />
          <Tab label={"My Projects"} value={"personal"} />
        </Tabs>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 3,
        }}
      >
        <TextField
          fullWidth
          label={"Search"}
          value={keyword ?? ""}
          InputProps={{
            endAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
          }}
          onChange={(e) => {
            const keyword = e.currentTarget.value;
            if (keyword.length) {
              setKeyword(keyword);
            } else {
              setKeyword(undefined);
            }
          }}
        />
      </Grid>
      {data?.map((x) => (
        <Grid
          key={x.project_id}
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <ProjectCard project={x} />
        </Grid>
      ))}
    </Grid>
  );
}

export default ProjectListPage;
