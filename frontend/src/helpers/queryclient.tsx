import { Typography } from "@mui/material";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { APIError } from "./fetch";

function errorHandler(err: unknown) {
  if (err instanceof APIError) {
    enqueueSnackbar({
      message: <Typography>{err.info.msg}</Typography>,
      variant: "error",
    });
  } else if (err instanceof Error) {
    enqueueSnackbar({
      message: <Typography>{err.message}</Typography>,
      variant: "error",
    });
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: errorHandler,
  }),
  mutationCache: new MutationCache({
    onError: errorHandler,
  }),
});
