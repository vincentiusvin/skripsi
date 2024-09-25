import { Language } from "@mui/icons-material";
import {
  Avatar,
  Drawer,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  MenuItem,
  Select,
} from "@mui/material";
import { useRoute } from "wouter";
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

function SideNav() {
  const route = useRouteMatcher();
  return (
    <Drawer open={true}>
      <Select
        label="View"
        value={route ?? ""}
        sx={{
          minWidth: 200,
        }}
        onChange={(x) => {
          x.target.value;
        }}
      >
        <MenuItem value={"browse"}>
          <StyledLink to={"/"}>
            <ListItem component={"div"}>
              <ListItemAvatar>
                <Avatar>
                  <Language />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Cari" />
            </ListItem>
          </StyledLink>
        </MenuItem>
        <ListSubheader>Projek</ListSubheader>
        <MenuItem value={"project-1"}>
          <StyledLink to={"/projects/1"}>
            <ListItem component={"div"}>
              <ListItemAvatar>
                <Avatar>
                  <Language />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary="Projek A" secondary="Admin" />
            </ListItem>
          </StyledLink>
        </MenuItem>
      </Select>
    </Drawer>
  );
}

export default SideNav;
