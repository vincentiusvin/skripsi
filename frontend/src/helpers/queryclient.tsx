import { Typography } from "@mui/material";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { APIError } from "./fetch";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (err, query) => {
      let snack = true;
      if (query.meta && query.meta.skip_error) {
        snack = false;
      }

      if (snack && err instanceof APIError) {
        enqueueSnackbar({
          message: <Typography>{err.message}</Typography>,
          variant: "error",
        });
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (err, _va, _ctx, mut) => {
      let snack = true;
      if (mut.meta && mut.meta.skip_error) {
        snack = false;
      }

      if (snack && err instanceof APIError) {
        enqueueSnackbar({
          message: <Typography>{err.message}</Typography>,
          variant: "error",
        });
      }
    },
  }),
});
