import { CorporateFare, Language, Work } from "@mui/icons-material";
import {
  Avatar,
  Drawer,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { ReactNode } from "react";
import { useRoute } from "wouter";
import { useOrgsGet } from "../queries/org_hooks.ts";
import { useProjectsGet } from "../queries/project_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";
import StyledLink from "./StyledLink.tsx";

type RouteRepresentation = "browse" | `project-${number}` | `orgs-${number}`;

function useRouteMatcher(): RouteRepresentation {
  const [projectMatch, projectParams] = useRoute("/projects/:project_id");
  const [orgMatch, orgParams] = useRoute("/orgs/:org_id");

  if (projectMatch) {
    return `project-${Number(projectParams.project_id)}`;
  }
  if (orgMatch) {
    return `orgs-${Number(orgParams.org_id)}`;
  }

  return "browse";
}

function UserSideNavContent(props: { user_id: number }) {
  const { user_id } = props;
  const route = useRouteMatcher();

  const { data: projects } = useProjectsGet({
    user_id,
  });

  const { data: orgs } = useOrgsGet({
    user_id,
  });

  const options: {
    title: string;
    icon: ReactNode;
    entries: {
      link: string;
      value: string;
      primary: string;
      secondary: string | null;
    }[];
  }[] = [
    {
      title: "Browse",
      icon: <Language />,
      entries: [
        {
          link: "/",
          value: "browse",
          primary: "Beranda",
          secondary: null,
        },
      ],
    },
  ];

  if (projects) {
    const filtered_projects = projects
      .filter((x) => {
        const role = x.project_members.find((x) => x.user_id === user_id)?.role;
        if (!role) {
          return false;
        }
        if (role !== "Admin" && role !== "Dev") {
          return false;
        }
        return true;
      })
      .map((x) => ({
        ...x,
        role: x.project_members.find((x) => x.user_id === user_id)?.role,
      }));

    options.push({
      title: "Proyek",
      icon: <Work />,
      entries: filtered_projects.map((x) => {
        return {
          link: `/projects/${x.project_id}`,
          value: `project-${x.project_id}`,
          primary: x.project_name,
          secondary: x.role!,
        };
      }),
    });
  }

  if (orgs) {
    const filtered_orgs = orgs
      .filter((x) => {
        const role = x.org_users.find((x) => x.user_id === user_id)?.user_role;
        if (!role) {
          return false;
        }
        if (role !== "Admin") {
          return false;
        }
        return true;
      })
      .map((x) => ({
        ...x,
        role: x.org_users.find((x) => x.user_id === user_id)?.user_role,
      }));

    options.push({
      title: "Organisasi",
      icon: <CorporateFare />,
      entries: filtered_orgs.map((x) => {
        return {
          link: `/orgs/${x.org_id}`,
          value: `orgs-${x.org_id}`,
          primary: x.org_name,
          secondary: x.role!,
        };
      }),
    });
  }

  return (
    <Select
      label="Dashboard"
      value={route}
      sx={{
        minWidth: 200,
      }}
    >
      {options.map((cat) => [
        <ListSubheader key={cat.title}>{cat.title}</ListSubheader>,
        cat.entries.map((entry) => (
          <MenuItem key={entry.primary} value={entry.value} dense>
            <StyledLink to={entry.link}>
              <ListItem component={"div"} dense>
                <ListItemAvatar>
                  <Avatar>{cat.icon}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={entry.primary} secondary={entry.secondary} />
              </ListItem>
            </StyledLink>
          </MenuItem>
        )),
      ])}
    </Select>
  );
}

function SideNav() {
  const { data: session } = useSessionGet();

  return (
    <Drawer open={false} variant="permanent">
      <Stack direction={"column"} gap={2} marginY={4} paddingX={2}>
        {session?.logged ? <UserSideNavContent user_id={session.user_id} /> : null}
      </Stack>
    </Drawer>
  );
}

export default SideNav;
