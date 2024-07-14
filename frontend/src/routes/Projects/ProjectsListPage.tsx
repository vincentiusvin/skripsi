import { Code, SearchOutlined, Shield } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useDebounce } from "use-debounce";
import { Link } from "wouter";
import { API } from "../../../../backend/src/routes.ts";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import { useOrgDetailGet } from "../../queries/org_hooks.ts";
import { useProjectsDetailMembersGet, useProjectsGet } from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

function ProjectCard(props: { project: API["ProjectsGet"]["ResBody"][number] }) {
  const { project } = props;
  const { data: org_data } = useOrgDetailGet({
    id: project.org_id,
  });
  const { data: session_data } = useSessionGet();
  const { data: role_data } = useProjectsDetailMembersGet({
    project_id: Number(project.project_id),
    user_id: session_data?.logged ? session_data.user_id : undefined,
  });

  return (
    <Link to={`/projects/${project.project_id}`}>
      <Card variant="elevation">
        <CardActionArea>
          <CardHeader
            title={
              <Typography variant="h5" fontWeight={"bold"}>
                {project.project_name}
              </Typography>
            }
            action={
              role_data?.role === "Admin" ? (
                <Tooltip title="Joined as administrator">
                  <Shield />
                </Tooltip>
              ) : role_data?.role === "Dev" ? (
                <Tooltip title="Joined as developer">
                  <Code />
                </Tooltip>
              ) : null
            }
            subheader={<Typography variant="body1">by {org_data?.org_name}</Typography>}
          />
          <CardContent>
            <Typography variant="body2">{project.project_desc}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
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
      <Grid item xs={2} />
      <Grid item xs={8}>
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
      <Grid item xs={2}>
        <TextField
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
      {data?.map((x, i) => (
        <Grid item xs={3} key={i}>
          <ProjectCard project={x} />
        </Grid>
      ))}
    </Grid>
  );
}

export default ProjectListPage;
