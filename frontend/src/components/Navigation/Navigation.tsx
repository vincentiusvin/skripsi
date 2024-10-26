import { Box, Stack } from "@mui/material";
import { ReactNode, useState } from "react";
import SideNav from "./SideNav.tsx";
import TopNav from "./TopNav.tsx";

function Navigation(props: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { children } = props;

  return (
    <Box display={"flex"} flexDirection={"column"} flexGrow={1}>
      <TopNav drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <Stack direction={"row"} mt={2} spacing={2} flexGrow={1}>
        <SideNav open={drawerOpen} setDrawerOpen={setDrawerOpen} />
        <Box flexGrow={1} paddingX={2} width={0}>
          {children}
        </Box>
      </Stack>
    </Box>
  );
}
export default Navigation;
