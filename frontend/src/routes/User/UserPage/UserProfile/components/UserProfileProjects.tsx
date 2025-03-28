import { Work } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ProjectCard from "../../../../../components/Cards/ProjectCard.tsx";
import { useProjectsGet } from "../../../../../queries/project_hooks.ts";

function UserProjectsList(props: { user_id: number }) {
  const { user_id } = props;
  const { data: projects_raw } = useProjectsGet({
    user_id,
  });
  const projects = projects_raw?.result;

  const [modalOpen, setModalOpen] = useState(false);

  if (!projects) {
    return <Skeleton />;
  }

  return (
    <>
      <Button
        onClick={() => {
          setModalOpen(true);
        }}
        variant="outlined"
        startIcon={<Work />}
      >
        Terlibat dalam {projects.length} proyek
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Daftar Proyek</DialogTitle>
        <DialogContent>
          {projects.length !== 0 ? (
            <Stack gap={2}>
              {projects.map((x) => (
                <ProjectCard project_id={x.project_id} key={x.project_id} />
              ))}
            </Stack>
          ) : (
            <Typography variant="body1">
              Pengguna ini tidak terlibat dalam proyek anapun.
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UserProjectsList;
