import { Save } from "@mui/icons-material";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useProjectsCategoriesGet, useProjectsPost } from "../../queries/project_hooks";

function ProjectsAddPage() {
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectCategory, setProjectCategory] = useState<number[]>([]);
  const { org_id: org_id_raw } = useParams();
  const org_id = Number(org_id_raw);

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
      org_id: org_id,
      category_id: projectCategory,
    });
  }

  const { data: categories } = useProjectsCategoriesGet();

  return (
    (<Grid container spacing={2} mt={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Tambah Project
        </Typography>
      </Grid>
      <Grid size={12}>
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
          <FormControl>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={projectCategory}
              label="Category"
              multiple
              onChange={(e) => setProjectCategory(e.target.value as number[])}
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
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addProject()}>
          Simpan
        </Button>
      </Grid>
    </Grid>)
  );
}

export default ProjectsAddPage;
