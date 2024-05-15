import { Box, Typography } from "@mui/material";

function HomePage() {
  return (
    <Box display={"flex"} justifyContent={"center"} alignItems={"center"} height={"100%"}>
      <Typography variant="h4" fontWeight="bold" align="center">
        Welcome to our app!
      </Typography>
    </Box>
  );
}

export default HomePage;
