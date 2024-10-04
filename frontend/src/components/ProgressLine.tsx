import { Box, Divider, LinearProgress } from "@mui/material";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

function ProgressLine() {
  const isMutating = useIsMutating();
  const isFetching = useIsFetching();

  return (
    <Box sx={{ width: "100%", minHeight: 4 }}>
      {isMutating || isFetching ? <LinearProgress /> : <Divider />}
    </Box>
  );
}
export default ProgressLine;
