import { Box, Stack, Theme, useMediaQuery } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import Footer from "./Footer.tsx";
import { NavigationContext, NavigationData } from "./NavigationContext.ts";
import SideNav from "./SideNav.tsx";
import TopNav from "./TopNav.tsx";

const suppress = ["/landing", "/login", "/register", "/reset-password"];

// Matiin navbar untuk halaman2 diatas.
// Terus restore state terakhir setelah leave halaman tersebut.
// Tapi juga bolehin user untuk buka navbar di halaman tadi, jangan dihide.
function useLocationAwareNav() {
  const responsive = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const [nav, setNav] = useState<NavigationData>({
    type: "browse",
    open: !responsive,
  });
  const [loc] = useLocation();
  const [manualOverride, setManualOverride] = useState(false);

  const overrideNav = { ...nav };
  if (!manualOverride && suppress.includes(loc)) {
    overrideNav.open = false;
  }

  const [projectMatch, projectParams] = useRoute("/projects/:project_id/*?");
  const [orgMatch, orgParams] = useRoute("/orgs/:org_id/*?");
  const [adminMatch] = useRoute("/admin/*?");

  useEffect(() => {
    if (projectMatch) {
      const project_id = Number(projectParams.project_id);
      if (!Number.isNaN(project_id)) {
        setNav((x) => ({
          type: "project",
          id: project_id,
          open: x.open,
        }));
        return;
      }
    }

    if (orgMatch) {
      const org_id = Number(orgParams.org_id);
      if (!Number.isNaN(org_id)) {
        setNav((x) => ({
          type: "orgs",
          id: org_id,
          open: x.open,
        }));
        return;
      }
    }

    if (adminMatch) {
      setNav((x) => ({
        type: "admin",
        open: x.open,
      }));
      return;
    }

    setNav((x) => ({
      type: "browse",
      open: x.open,
    }));
  }, [orgMatch, orgParams?.org_id, projectMatch, projectParams?.project_id, adminMatch]);

  useEffect(() => {
    setManualOverride(false);
  }, [loc]);

  function overrideSetNav(arg: Parameters<typeof setNav>[0]) {
    setManualOverride(true);
    if (typeof arg === "function") {
      setNav(arg(overrideNav));
    } else {
      setNav(arg);
    }
  }

  return [overrideNav, overrideSetNav] as const;
}

function Navigation(props: { children: ReactNode }) {
  const { children } = props;
  const [nav, setNav] = useLocationAwareNav();

  const [loc] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [loc]);

  return (
    <Box>
      <NavigationContext.Provider value={[nav, setNav]}>
        <TopNav />
        <Stack direction={"row"} mt={2} flexGrow={1}>
          <SideNav />
          <Box flexGrow={1} paddingX={2} width={0}>
            <Box
              sx={{
                minHeight: "calc(100vh - 64px)",
              }}
            >
              {children}
            </Box>
            <Footer />
          </Box>
        </Stack>
      </NavigationContext.Provider>
    </Box>
  );
}
export default Navigation;
