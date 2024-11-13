import { SearchOutlined } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Fragment, useState } from "react";
import { useDebounce } from "use-debounce";
import { useParams } from "wouter";
import { useProjectsDetailGet } from "../../queries/project_hooks.ts";
import { useUsersGet } from "../../queries/user_hooks.ts";
import AuthorizeProjects from "./components/AuthorizeProjects.tsx";
import ProjectMember from "./components/ProjectMember.tsx";

function InviteMembersDialog(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });
  const [inviteMembers, setInviteMembers] = useState(false);
  const [keyword, setKeyword] = useState<string>("");
  const [debouncedKeyword] = useDebounce(keyword, 300);
  const { data: users } = useUsersGet({
    keyword: debouncedKeyword,
  });

  if (project == undefined) {
    return <Skeleton />;
  }

  const project_members = project?.project_members.map((x) => x.user_id);
  const invitable = users?.filter((x) => !project_members.includes(x.user_id));

  function reset() {
    setInviteMembers(false);
    setKeyword("");
  }

  return (
    <>
      <Dialog open={inviteMembers} onClose={() => reset()}>
        <DialogTitle>Undang anggota baru</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Cari pengguna"
              onChange={(e) => setKeyword(e.target.value)}
              value={keyword}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {invitable != undefined ? (
              invitable.map((x) => (
                <ProjectMember
                  project_id={project_id}
                  user_id={x.user_id}
                  key={x.user_id}
                  putOption={{
                    role: "Invited",
                    text: "Invite",
                  }}
                />
              ))
            ) : (
              <Skeleton />
            )}
          </Stack>
        </DialogContent>
      </Dialog>
      <Button onClick={() => setInviteMembers(true)} variant="contained">
        Undang Anggota Baru
      </Button>
    </>
  );
}

function ProjectPeople(props: { project_id: number }) {
  const { project_id } = props;
  const { data: project } = useProjectsDetailGet({ project_id });

  if (!project) {
    return <Skeleton />;
  }

  const pending_members = project.project_members.filter((x) => x.role === "Pending");
  const invited_members = project.project_members.filter((x) => x.role === "Invited");
  const active_members = project.project_members.filter(
    (x) => x.role === "Admin" || x.role === "Dev",
  );

  const memberTypes = [
    {
      members: pending_members,
      deleteOption: {
        text: "Reject",
      },
      putOption: {
        text: "Approve",
        role: "Dev",
      },
      name: "Anggota Pending",
    },
    {
      members: active_members,
      deleteOption: {
        text: "Remove",
      },
      putOption: undefined,
      name: "Anggota Aktif",
    },
    {
      members: invited_members,
      deleteOption: {
        text: "Cancel",
      },
      putOption: undefined,
      name: "Anggota Diundang",
    },
  ] as const;

  return (
    <Stack gap={2}>
      <Typography variant="h4" fontWeight={"bold"} textAlign={"center"}>
        Anggota Proyek
      </Typography>
      <InviteMembersDialog project_id={project_id} />
      {memberTypes.map((x, i) => (
        <Fragment key={i}>
          <Typography variant="h6" textAlign={"center"}>
            {x.name} ({x.members.length})
          </Typography>
          {x.members.length ? (
            <Grid container width={"85%"} margin={"0 auto"} spacing={2} columnSpacing={4}>
              {x.members.map((m) => (
                <Grid
                  key={m.user_id}
                  size={{
                    xs: 12,
                    md: 4,
                    lg: 3,
                  }}
                >
                  <ProjectMember
                    deleteOption={x.deleteOption}
                    putOption={x.putOption}
                    project_id={project_id}
                    user_id={m.user_id}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography textAlign={"center"}>Tidak ada {x.name.toLocaleLowerCase()}!</Typography>
          )}
        </Fragment>
      ))}
    </Stack>
  );
}

function ProjectsPeoplePage() {
  const { project_id: id } = useParams();
  const project_id = Number(id);

  return (
    <AuthorizeProjects allowedRoles={["Admin"]}>
      <ProjectPeople project_id={project_id} />
    </AuthorizeProjects>
  );
}

export default ProjectsPeoplePage;
