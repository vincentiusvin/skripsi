import { Box, Stack } from "@mui/material";
import { ReactNode, useState } from "react";
import Footer from "./Footer.tsx";
import SideNav from "./SideNav.tsx";
import TopNav from "./TopNav.tsx";

function Navigation(props: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { children } = props;

  return (
    <Box>
      <TopNav drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <Stack direction={"row"} mt={2} flexGrow={1}>
        <SideNav open={drawerOpen} setDrawerOpen={setDrawerOpen} />
        <Box
          flexGrow={1}
          paddingX={2}
          width={0}
          sx={{
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
          <Footer />
        </Box>
      </Stack>
    </Box>
  );
}
export default Navigation;
