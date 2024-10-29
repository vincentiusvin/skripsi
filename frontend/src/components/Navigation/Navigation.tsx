import { Box, Stack } from "@mui/material";
import { ReactNode, useState } from "react";
import Footer from "./Footer.tsx";
import { NavigationContext, NavigationData } from "./NavigationContext.ts";
import SideNav from "./SideNav.tsx";
import TopNav from "./TopNav.tsx";

function Navigation(props: { children: ReactNode }) {
  const { children } = props;
  const nav = useState<NavigationData>({
    type: "browse",
    open: true,
  });

  return (
    <Box>
      <NavigationContext.Provider value={nav}>
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
