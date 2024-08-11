import { ArrowBack, Save } from "@mui/icons-material";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  useProjectsCategoriesGet,
  useProjectsDetailGet,
  useProjectsDetailPut,
} from "../../queries/project_hooks";

function ProjectsEditPage() {
  const [projectName, setProjectName] = useState<string | undefined>();
  const [projectDesc, setProjectDesc] = useState<string | undefined>();
  const [projectCategory, setProjectCategory] = useState<number[] | undefined>();
  const { project_id: project_id_raw } = useParams();
  const project_id = Number(project_id_raw);

  const [, setLocation] = useLocation();

  const { data: oldData } = useProjectsDetailGet({
    project_id,
  });

  const { mutate: editProject } = useProjectsDetailPut({
    project_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Projek berhasil diedit!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation(`/projects/${project_id}`);
    },
  });

  function addProject() {
    editProject({
      project_desc: projectDesc,
      project_name: projectName,
      category_id: projectCategory,
    });
  }

  const { data: categories } = useProjectsCategoriesGet();

  if (!oldData) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={2}>
        <Link to={`/projects/${project_id}`}>
          <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
            Kembali
          </Button>
        </Link>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Edit Project
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
            defaultValue={oldData.project_name}
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setProjectDesc(e.target.value)}
            label="Description"
            defaultValue={oldData.project_desc}
          ></TextField>
          <FormControl>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={projectCategory}
              label="Category"
              multiple
              onChange={(e) => setProjectCategory(e.target.value as number[])}
              defaultValue={oldData.project_categories.map((x) => x.category_id)}
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

export default ProjectsEditPage;
