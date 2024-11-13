import {
  Chat,
  CorporateFare,
  Dashboard,
  EmojiEvents,
  Flag,
  Home,
  Language,
  Logout,
  ManageAccounts,
  Message,
  People,
  Settings,
  Shield,
  Update,
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
  Skeleton,
  Theme,
  useMediaQuery,
} from "@mui/material";
import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useOrgsGet } from "../../queries/org_hooks.ts";
import { useProjectsGet } from "../../queries/project_hooks.ts";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";
import { useUsersDetailGet } from "../../queries/user_hooks.ts";
import StyledLink from "../StyledLink.tsx";
import {
  NavigationData,
  NavigationRaw,
  navData2NavRaw,
  navRaw2NavData,
  useNavigation,
} from "./NavigationContext.ts";

function SideNavSelector(props: { user_id: number; showAll?: boolean }) {
  const { user_id, showAll } = props;

  const { data: projects_raw } = useProjectsGet({
    user_id: showAll ? undefined : user_id,
  });
  const projects = projects_raw?.result;

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
      value: NavigationRaw;
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

  const [nav, setNav] = useNavigation();
  const nav2raw = navData2NavRaw(nav);

  return (
    <Select
      fullWidth
      value={nav2raw}
      onChange={(x) => {
        setNav((oldNav) => navRaw2NavData(x.target.value as NavigationRaw, oldNav.open));
      }}
    >
      {options.map((cat) => [
        <ListSubheader key={cat.title}>{cat.title}</ListSubheader>,
        cat.entries.map((entry) => (
          <MenuItem key={entry.value} value={entry.value} dense>
            <ListItem
              component={"div"}
              dense
              sx={{
                width: 240,
              }}
            >
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

function SideNavDashboard() {
  const [_navData] = useNavigation();
  const { data: session } = useSessionGet();
  const [location] = useLocation();
  const navData: NavigationData = session?.logged
    ? _navData
    : { type: "browse", open: _navData.open };

  let links: {
    link: string;
    name: string;
    avatar: ReactNode;
  }[] = [];

  if (!navData || navData.type === "browse") {
    links = [
      {
        link: `/landing`,
        name: `Beranda`,
        avatar: <Home />,
      },
    ];

    if (session?.logged) {
      links.push({
        link: `/`,
        name: `Dashboard`,
        avatar: <Dashboard />,
      });
    }

    links.push(
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
        link: `/users`,
        name: `Cari Teman`,
        avatar: <People />,
      },
    );

    if (session?.logged) {
      links.push(
        {
          link: `/chatrooms`,
          name: `Pesan`,
          avatar: <Message />,
        },
        {
          link: `/reports`,
          name: `Laporan`,
          avatar: <Flag />,
        },
        {
          link: `/settings`,
          name: `Preferensi`,
          avatar: <Settings />,
        },
      );
    }
  } else if (navData.type === "project") {
    const project_id = navData.id;
    links = [
      {
        link: `/projects/${project_id}`,
        name: `Profil`,
        avatar: <People />,
      },
      {
        link: `/projects/${project_id}/activity`,
        name: `Aktivitas`,
        avatar: <Update />,
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
        link: `/projects/${project_id}/contributions`,
        name: `Kontribusi`,
        avatar: <EmojiEvents />,
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
  } else if (navData.type === "orgs") {
    const org_id = navData.id;
    links = [
      {
        link: `/orgs/${org_id}`,
        name: `Profil`,
        avatar: <People />,
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
  } else if (navData.type === "admin") {
    links = [
      {
        link: `/admin/manage-reports`,
        name: `Laporan`,
        avatar: <Flag />,
      },
      {
        link: `/admin/manage-accounts`,
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
            <ListItemButton selected={location === x.link}>
              <ListItemIcon>{x.avatar}</ListItemIcon>
              <ListItemText>{x.name}</ListItemText>
            </ListItemButton>
          </ListItem>
        </StyledLink>
      ))}
    </List>
  );
}

function SideNav() {
  const { data: session } = useSessionGet();
  const [nav, setNav] = useNavigation();
  const open = nav.open;

  const responsive = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));

  if (session == undefined) {
    return <Skeleton />;
  }

  return (
    <Drawer
      open={open}
      onClose={() => {
        setNav((x) => ({
          ...x,
          open: false,
        }));
      }}
      variant={responsive ? "temporary" : "persistent"}
      anchor="left"
      sx={{
        width: open ? 240 : 0,
      }}
    >
      <Box
        sx={{
          overflow: "auto",
          marginY: 4,
          marginTop: 12,
          paddingX: 2,
          width: 240,
        }}
      >
        {session?.logged ? (
          <SideNavSelector user_id={session.user_id} showAll={session.is_admin} />
        ) : null}
        <SideNavDashboard />
      </Box>
    </Drawer>
  );
}

export default SideNav;
