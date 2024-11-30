import { Save } from "@mui/icons-material";
import {
  Box,
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
import RichEditor from "../../components/RichEditor.tsx";
import { handleOptionalStringCreation } from "../../helpers/misc.ts";
import { useProjectsCategoriesGet, useProjectsPost } from "../../queries/project_hooks";
import AuthorizeOrgs from "../Orgs/components/AuthorizeOrgs.tsx";

function ProjectsAdd(props: { org_id: number }) {
  const { org_id } = props;
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectContent, setProjectContent] = useState<undefined | string>();
  const [projectCategory, setProjectCategory] = useState<number[]>([]);

  const [, setLocation] = useLocation();

  const { mutate: postProject } = useProjectsPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Proyek berhasil ditambahkan!</Typography>,
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
      project_content: handleOptionalStringCreation(projectContent),
    });
  }

  const { data: categories } = useProjectsCategoriesGet();

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Tambah Proyek
        </Typography>
      </Grid>
      <Grid size={12}>
        <Stack spacing={4}>
          <TextField
            required
            fullWidth
            onChange={(e) => setProjectName(e.target.value)}
            label="Nama Proyek"
          ></TextField>
          <TextField
            required
            fullWidth
            onChange={(e) => setProjectDesc(e.target.value)}
            label="Deskripsi Singkat"
          ></TextField>
          <FormControl>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={projectCategory}
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
          <Box>
            <RichEditor
              label="Detail Proyek"
              onBlur={(x) => setProjectContent(x)}
              defaultValue={projectContent ?? ""}
            />
          </Box>
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

function ProjectsAddPage() {
  const { org_id: org_id_raw } = useParams();
  const org_id = Number(org_id_raw);
  return (
    <AuthorizeOrgs allowedRoles={["Admin"]}>
      <ProjectsAdd org_id={org_id} />
    </AuthorizeOrgs>
  );
}

export default ProjectsAddPage;
