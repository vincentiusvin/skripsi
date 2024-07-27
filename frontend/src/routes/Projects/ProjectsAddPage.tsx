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
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useProjectsCategoriesGet, useProjectsPost } from "../../queries/project_hooks";

function ProjectsAddPage() {
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [orgId, setOrgId] = useState("");
  const [projectCategory, setProjectCategory] = useState<number | null>(null);
  const orgIdNumber = Number(orgId);

  const [, setLocation] = useLocation();

  const { mutate: postProject } = useProjectsPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Added successful</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/projects");
    },
  });

  function addProject() {
    postProject({
      project_desc: projectDesc,
      project_name: projectName,
      org_id: orgIdNumber,
      category_id: projectCategory != null ? [projectCategory] : [],
    });
  }

  const { data: categories } = useProjectsCategoriesGet();

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
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default ProjectsAddPage;
