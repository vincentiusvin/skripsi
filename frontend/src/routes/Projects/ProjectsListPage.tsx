import { SearchOutlined } from "@mui/icons-material";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useDebounce } from "use-debounce";
import { Link } from "wouter";
import { useSearchParams, useStateSearch } from "../../helpers/search.ts";
import { useProjectsGet } from "../../queries/project_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

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
          <Link to={`/projects/${x.project_id}`}>
            <Card variant="elevation">
              <CardActionArea>
                <CardContent>
                  <Stack direction={"row"} alignItems={"center"} spacing={2}>
                    <Box>
                      <Typography variant="h5" fontWeight={"bold"}>
                        {x.project_name}
                      </Typography>
                      <Typography>{x.org_id}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}

export default ProjectListPage;
