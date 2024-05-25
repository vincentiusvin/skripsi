import { ArrowBack, Save } from "@mui/icons-material";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { APIContext, APIError } from "../helpers/fetch";
import { queryClient } from "../helpers/queryclient";

function projectsAddPage() {
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [orgId, setOrgId] = useState("");
  const [projectCategory, setProjectCategory] = useState<number | "">("");
  const orgIdNumber = Number(orgId);

  const [, setLocation] = useLocation();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => new APIContext("getProjectsCategory").fetch(`/api/projects-category`),
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 401) || failureCount > 3) {
        setLocation("/projects");
        return false;
      }
      return true;
    },
  });

  const { mutate: addProject } = useMutation({
    mutationKey: ["session"],
    mutationFn: () =>
      new APIContext("addProjects").fetch("/api/projects", {
        method: "POST",
        body: {
          project_name: projectName,
          project_desc: projectDesc,
          org_id: orgIdNumber,
          category_id: Number(projectCategory),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      enqueueSnackbar({
        message: <Typography>Added successful</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/projects");
    },
  });

  return (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={2}>
        <Link to={"/projects"}>
          <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
            Kembali
          </Button>
        </Link>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Tambah Project
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addProject()}>
          Simpan
        </Button>
      </Grid>
      <Grid item xs={8}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            onChange={(e) => setProjectName(e.target.value)}
            label="Name"
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setProjectDesc(e.target.value)}
            label="Description"
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgId(e.target.value)}
            label="organisation id"
          ></TextField>
          <FormControl>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={projectCategory}
              label="Category"
              onChange={(e) => setProjectCategory(Number(e.target.value))}
            >
              {categories &&
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default projectsAddPage;
