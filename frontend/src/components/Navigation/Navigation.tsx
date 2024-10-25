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
        <Box
          sx={{
            display: {
              xs: "none",
              md: "block",
            },
          }}
        >
          <SideNav />
        </Box>
        <Box
          sx={{
            display: {
              md: "none",
              xs: "block",
            },
          }}
        >
          <SideNav responsive open={drawerOpen} setDrawerOpen={setDrawerOpen} />
        </Box>
        <Box flexGrow={1} paddingX={2} width={"100%"}>
          {children}
        </Box>
      </Stack>
    </>
  );
}
export default Navigation;
