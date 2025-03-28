import { Save } from "@mui/icons-material";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import RichEditor from "../../components/RichEditor.tsx";
import { handleOptionalStringUpdate } from "../../helpers/misc.ts";
import {
  useProjectsCategoriesGet,
  useProjectsDetailGet,
  useProjectsDetailPut,
} from "../../queries/project_hooks";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";

function ProjectsEdit(props: { project_id: number }) {
  const { project_id } = props;
  const [projectName, setProjectName] = useState<string | undefined>();
  const [projectDesc, setProjectDesc] = useState<string | undefined>();
  const [projectContent, setProjectContent] = useState<string | undefined>();
  const [projectCategory, setProjectCategory] = useState<number[] | undefined>();

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
      project_content: handleOptionalStringUpdate(projectContent),
    });
  }

  const { data: categories } = useProjectsCategoriesGet();

  if (!oldData) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Edit Proyek
        </Typography>
      </Grid>
      <Grid size={12}>
        <Stack spacing={4}>
          <TextField
            required
            fullWidth
            onChange={(e) => setProjectName(e.target.value)}
            label="Nama Proyek"
            value={projectName ?? oldData.project_name}
          ></TextField>
          <TextField
            required
            fullWidth
            onChange={(e) => setProjectDesc(e.target.value)}
            label="Deskripsi Singkat"
            value={projectDesc ?? oldData.project_desc}
          ></TextField>
          <FormControl>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={projectCategory ?? oldData.project_categories.map((x) => x.category_id)}
              label="Kategori"
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
          <RichEditor
            label="Detail Proyek"
            onBlur={(x) => setProjectContent(x)}
            defaultValue={projectContent ?? oldData.project_content ?? ""}
          />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addProject()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function ProjectsEditPage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin"]}>
      <ProjectsEdit project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsEditPage;
