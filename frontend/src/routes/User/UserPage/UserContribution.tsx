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
import { useLocation } from "wouter";
import { useContributionsPost } from "../../../queries/contribution_hooks";
import { useProjectsGet } from "../../../queries/project_hooks"; // Hook to fetch projects for dropdown

function ContributionsAddPage() {
  const [contributionName, setContributionName] = useState("");
  const [contributionDesc, setContributionDesc] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [userIds, setUserIds] = useState<string>(""); // Comma-separated list of user IDs

  const [, setLocation] = useLocation();

  // Hook to add a new contribution
  const { mutate: postContribution } = useContributionsPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Contribution added successfully!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/contributions"); // Redirect after success
    },
  });

  // Hook to fetch project data for the dropdown
  const { data: projects } = useProjectsGet();

  // Handle submission of the form
  function addContribution() {
    const userIdArray = userIds.split(",").map((id) => Number(id.trim())); // Convert to array of numbers
    postContribution({
        name: contributionName, // Correct key
        description: contributionDesc,
        project_id: Number(projectId),
        user_id: userIdArray,
      });

  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Add Contribution
        </Typography>
      </Grid>
      <Grid size={12}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            label="Contribution Name"
            value={contributionName}
            onChange={(e) => setContributionName(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Contribution Description"
            value={contributionDesc}
            onChange={(e) => setContributionDesc(e.target.value)}
            required
            multiline
            rows={4}
          />
          <FormControl fullWidth>
            <InputLabel id="project-select-label">Project</InputLabel>
            <Select
              labelId="project-select-label"
              value={projectId}
              label="Project"
              onChange={(e) => setProjectId(e.target.value as number)}
              required
            >
              {projects &&
                projects.map((project) => (
                  <MenuItem key={project.project_id} value={project.project_id}>
                    {project.project_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="User IDs (comma-separated)"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
            required
            helperText="Enter user IDs as comma-separated values (e.g., 1,2,3)"
          />
        </Stack>
      </Grid>
      <Grid size={12}>
        <Button
          variant="contained"
          fullWidth
          endIcon={<Save />}
          onClick={() => addContribution()}
          disabled={!contributionName || !contributionDesc || !projectId || !userIds}
        >
          Save Contribution
        </Button>
      </Grid>
    </Grid>
  );
}

export default ContributionsAddPage;
