import { Avatar, Box, Button, Grid, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import {
  useProjectsDetailGet,
  useProjectsDetailMembersPutVariableID,
} from "../../../queries/project_hooks.ts";
import { useUsersGet } from "../../../queries/user_hooks.ts";

function ProjectManage(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });
  const { data: users } = useUsersGet();

  const { mutate: putMember } = useProjectsDetailMembersPutVariableID({
    project_id: project_id,
    onSuccess: (x) => {
      enqueueSnackbar({
        variant: "success",
        message: <Typography>User berhasil ditambahkan sebagai {x.role}!</Typography>,
      });
    },
  });

  if (!project) {
    return <Skeleton />;
  }

  return (
    <Grid container width={"85%"} margin={"0 auto"} mt={2} spacing={2} columnSpacing={4}>
      {project.project_members
        .filter((x) => x.role === "Pending")
        .map((x, i) => {
          const user = users?.find((u) => u.user_id === x.user_id);

          return (
            <Grid item xs={3} key={i} justifyContent={"center"}>
              <Paper
                sx={{
                  padding: 2,
                  borderRadius: 2,
                }}
              >
                <Stack direction={"row"} spacing={2} justifyContent={"center"}>
                  <Avatar />
                  <Box flexGrow={1}>
                    <Typography>{user?.user_name}</Typography>
                    <Typography variant="body2" color={"GrayText"}>
                      {x.role}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => {
                      putMember({
                        role: "Dev",
                        user_id: x.user_id,
                      });
                    }}
                  >
                    Approve
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          );
        })}
    </Grid>
  );
}

export default ProjectManage;
