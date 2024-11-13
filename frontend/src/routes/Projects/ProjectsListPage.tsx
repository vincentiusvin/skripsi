import { SearchOutlined } from "@mui/icons-material";
import { InputAdornment, Tab, Tabs, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useDebounce } from "use-debounce";
import ProjectCard from "../../components/Cards/ProjectCard.tsx";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import { useProjectsGet } from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

function ProjectListPage() {
  const { data: session } = useSessionGet();

  const searchHook = useSearchParams();
  const [personal, setPersonal] = useStateSearch("personal", searchHook);
  const [keyword, setKeyword] = useStateSearch("keyword", searchHook);

  const [debouncedKeyword] = useDebounce(keyword, 250);

  const { data: projects_raw } = useProjectsGet({
    user_id: personal === "true" && session?.logged ? session.user_id : undefined,
    keyword:
      typeof debouncedKeyword === "string" && debouncedKeyword.length
        ? debouncedKeyword
        : undefined,
  });
  const projects = projects_raw?.result;

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
          Proyek
        </Typography>
      </Grid>
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
          <Tab label={"Semua Proyek"} value={"all"} />
          <Tab label={"Proyek Saya"} value={"personal"} />
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
          label={"Cari proyek"}
          value={keyword ?? ""}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            },
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
      {projects?.map((x) => (
        <Grid
          key={x.project_id}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <ProjectCard project_id={x.project_id} />
        </Grid>
      ))}
    </Grid>
  );
}

export default ProjectListPage;
