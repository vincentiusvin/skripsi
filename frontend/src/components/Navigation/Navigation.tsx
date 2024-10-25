import { Box, Stack } from "@mui/material";
import { ReactNode, useState } from "react";
import SideNav from "./SideNav.tsx";
import TopNav from "./TopNav.tsx";

function Navigation(props: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { children } = props;

  return (
    <>
      <TopNav drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen} />
      <Stack direction={"row"} flexGrow={1} mt={2}>
        <SideNav open={drawerOpen} setDrawerOpen={setDrawerOpen} />
        <Box flexGrow={1} paddingX={2} width={"100%"}>
          {children}
        </Box>
      </Stack>
    </>
  );
}
export default Navigation;
