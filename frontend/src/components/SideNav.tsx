import {
  Chat,
  CorporateFare,
  Flag,
  Home,
  Language,
  Logout,
  ManageAccounts,
  Message,
  People,
  Settings,
  Shield,
  Work,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { useOrgsGet } from "../queries/org_hooks.ts";
import { useProjectsGet } from "../queries/project_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../queries/user_hooks.ts";
import StyledLink from "./StyledLink.tsx";

type SidenavContext = "browse" | `project-${number}` | `orgs-${number}` | "admin";

function parseSidenavContext(x: SidenavContext) {
  if (x === "browse") {
    return {
      type: "browse",
    } as const;
  } else if (x.startsWith("project-")) {
    const project_id = Number(x.split("-")[1]);
    return {
      type: "project",
      id: project_id,
    } as const;
  } else if (x.startsWith("orgs-")) {
    const org_id = Number(x.split("-")[1]);
    return {
      type: "orgs",
      id: org_id,
    } as const;
  } else if (x === "admin") {
    return {
      type: "admin",
    } as const;
  }
}

function UserSideNavSelector(props: {
  user_id: number;
  value: SidenavContext;
  showAll?: boolean;
  onChange: (x: SidenavContext) => void;
}) {
  const { user_id, value, onChange, showAll } = props;

  const { data: projects } = useProjectsGet({
    user_id: showAll ? undefined : user_id,
  });

  const { data: user } = useUsersDetailGet({
    user_id,
  });

  const { data: orgs } = useOrgsGet({
    user_id: showAll ? undefined : user_id,
  });

  const options: {
    title: string;
    icon: ReactNode;
    entries: {
      value: string;
      primary: string;
      secondary: string | null;
    }[];
  }[] = [
    {
      title: "Jelajah",
      icon: <Language />,
      entries: [
        {
          value: "browse",
          primary: "Jelajah",
          secondary: null,
        },
      ],
    },
  ];

  if (user && user.user_is_admin) {
    options.push({
      title: "Admin",
      icon: <Shield />,
      entries: [
        {
          value: `admin`,
          primary: "Administrasi",
          secondary: null,
        },
      ],
    });
  }

  if (projects) {
    const filtered_projects = projects
      .filter((x) => {
        if (showAll) {
          return true;
        }
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

    if (filtered_projects.length) {
      options.push({
        title: "Proyek",
        icon: <Work />,
        entries: filtered_projects.map((x) => {
          return {
            value: `project-${x.project_id}`,
            primary: x.project_name,
            secondary: x.role!,
          };
        }),
      });
    }
  }

  if (orgs) {
    const filtered_orgs = orgs
      .filter((x) => {
        if (showAll) {
          return true;
        }
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

    if (filtered_orgs.length) {
      options.push({
        title: "Organisasi",
        icon: <CorporateFare />,
        entries: filtered_orgs.map((x) => {
          return {
            value: `orgs-${x.org_id}`,
            primary: x.org_name,
            secondary: x.role!,
          };
        }),
      });
    }
  }

  return (
    <Select
      fullWidth
      value={value}
      onChange={(x) => {
        onChange(x.target.value as SidenavContext);
      }}
    >
      {options.map((cat) => [
        <ListSubheader key={cat.title}>{cat.title}</ListSubheader>,
        cat.entries.map((entry) => (
          <MenuItem key={entry.primary} value={entry.value} dense>
            <ListItem component={"div"} dense>
              <ListItemAvatar>
                <Avatar>{cat.icon}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={entry.primary} secondary={entry.secondary} />
            </ListItem>
          </MenuItem>
        )),
      ])}
    </Select>
  );
}

function ContextualDashboard(props: { context: SidenavContext }) {
  const { context } = props;
  const parsedContext = parseSidenavContext(context);

  let links: {
    link: string;
    name: string;
    avatar: ReactNode;
  }[] = [];

  if (!parsedContext || parsedContext.type === "browse") {
    links = [
      {
        link: `/`,
        name: `Beranda`,
        avatar: <Home />,
      },
      {
        link: `/orgs`,
        name: `Cari Organisasi`,
        avatar: <CorporateFare />,
      },
      {
        link: `/projects`,
        name: `Cari Proyek`,
        avatar: <Work />,
      },
      {
        link: `/friends`,
        name: `Cari Teman`,
        avatar: <People />,
      },
      {
        link: `/chatroom`,
        name: `Pesan`,
        avatar: <Message />,
      },
    ];
  } else if (parsedContext.type === "project") {
    const project_id = parsedContext.id;
    links = [
      {
        link: `/projects/${project_id}`,
        name: `Beranda`,
        avatar: <Home />,
      },
      {
        link: `/projects/${project_id}/chat`,
        name: `Diskusi`,
        avatar: <Chat />,
      },
      {
        link: `/projects/${project_id}/people`,
        name: `Anggota`,
        avatar: <ManageAccounts />,
      },
      {
        link: `/projects/${project_id}/tasks`,
        name: `Tugas`,
        avatar: <Work />,
      },
      {
        link: `/projects/${project_id}/contribs`,
        name: `Kontribusi`,
        avatar: <Work />,
      },
      {
        link: `/projects/${project_id}/manage`,
        name: `Atur Proyek`,
        avatar: <Settings />,
      },
      {
        link: `/projects/${project_id}/leave`,
        name: `Keluar`,
        avatar: <Logout />,
      },
    ];
  } else if (parsedContext.type === "orgs") {
    const org_id = parsedContext.id;
    links = [
      {
        link: `/orgs/${org_id}`,
        name: `Beranda`,
        avatar: <Home />,
      },
      {
        link: `/orgs/${org_id}/people`,
        name: `Pengurus`,
        avatar: <ManageAccounts />,
      },
      {
        link: `/orgs/${org_id}/add-projects`,
        name: `Buat Proyek Baru`,
        avatar: <Work />,
      },
      {
        link: `/orgs/${org_id}/manage`,
        name: `Atur Organisasi`,
        avatar: <Settings />,
      },
      {
        link: `/orgs/${org_id}/leave`,
        name: `Keluar`,
        avatar: <Logout />,
      },
    ];
  } else if (parsedContext.type === "admin") {
    links = [
      {
        link: `/reports`,
        name: `Laporan`,
        avatar: <Flag />,
      },
      {
        link: `/accounts`,
        name: `Atur Pengguna`,
        avatar: <People />,
      },
    ];
  }

  return (
    <List dense>
      {links.map((x) => (
        <StyledLink to={x.link} key={x.name}>
          <ListItem dense>
            <ListItemButton>
              <ListItemIcon>{x.avatar}</ListItemIcon>
              <ListItemText>{x.name}</ListItemText>
            </ListItemButton>
          </ListItem>
        </StyledLink>
      ))}
    </List>
  );
}

function SideNav(props: {
  responsive?: boolean;
  open?: boolean;
  setDrawerOpen?: (x: boolean) => void;
}) {
  const { data: session } = useSessionGet();
  const [activeDashboard, setActiveDashboard] = useState<SidenavContext>("browse");
  const { responsive, setDrawerOpen, open } = props;

  return (
    <Drawer
      open={open}
      onClose={() => {
        if (setDrawerOpen) {
          setDrawerOpen(false);
        }
      }}
      variant={responsive ? "temporary" : "permanent"}
      anchor="left"
      sx={{
        width: 240,
      }}
    >
      <Box
        sx={{
          width: 240,
          overflow: "auto",
          marginY: 4,
          marginTop: 12,
          paddingX: 2,
        }}
      >
        {session?.logged ? (
          <UserSideNavSelector
            user_id={session.user_id}
            value={activeDashboard}
            showAll={session.is_admin}
            onChange={(x) => setActiveDashboard(x)}
          />
        ) : null}
        <ContextualDashboard context={activeDashboard} />
      </Box>
    </Drawer>
  );
}

export default SideNav;
