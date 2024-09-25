import {
  AccountBalance,
  CorporateFare,
  Home,
  Language,
  ManageAccounts,
  Work,
} from "@mui/icons-material";
import {
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { useOrgsGet } from "../queries/org_hooks.ts";
import { useProjectsGet } from "../queries/project_hooks.ts";
import { useSessionGet } from "../queries/sesssion_hooks.ts";
import StyledLink from "./StyledLink.tsx";

type SidenavContext = "browse" | `project-${number}` | `orgs-${number}`;

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
  }
}

function UserSideNavSelector(props: {
  user_id: number;
  value: SidenavContext;
  onChange: (x: SidenavContext) => void;
}) {
  const { user_id, value, onChange } = props;

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
      sx={{
        minWidth: 240,
      }}
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
        link: `/projects/${project_id}`,
        name: `Kontributor`,
        avatar: <ManageAccounts />,
      },
      {
        link: `/projects/${project_id}`,
        name: `Tugas`,
        avatar: <Work />,
      },
      {
        link: `/projects/${project_id}`,
        name: `Kontribusi`,
        avatar: <Work />,
      },
      {
        link: `/projects/${project_id}/edit`,
        name: `Edit Proyek`,
        avatar: <AccountBalance />,
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
        link: `/orgs/${org_id}`,
        name: `Pengurus`,
        avatar: <ManageAccounts />,
      },
      {
        link: `/orgs/${org_id}`,
        name: `Atur Proyek`,
        avatar: <Work />,
      },
      {
        link: `/orgs/${org_id}/edit`,
        name: `Edit Organisasi`,
        avatar: <AccountBalance />,
      },
    ];
  }

  return (
    <List dense>
      {links.map((x) => (
        <StyledLink to={x.link} key={x.name}>
          <ListItem dense>
            <ListItemIcon>{x.avatar}</ListItemIcon>
            <ListItemText>{x.name}</ListItemText>
          </ListItem>
        </StyledLink>
      ))}
    </List>
  );
}

function SideNav() {
  const { data: session } = useSessionGet();
  const [activeDashboard, setActiveDashboard] = useState<SidenavContext>("browse");

  return (
    <Drawer variant="permanent">
      <Stack direction={"column"} gap={2} marginY={4} paddingX={2}>
        {session?.logged ? (
          <UserSideNavSelector
            user_id={session.user_id}
            value={activeDashboard}
            onChange={(x) => setActiveDashboard(x)}
          />
        ) : null}
        <ContextualDashboard context={activeDashboard} />
      </Stack>
    </Drawer>
  );
}

export default SideNav;
