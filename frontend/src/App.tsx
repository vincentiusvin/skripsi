import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { SnackbarProvider, closeSnackbar, enqueueSnackbar } from "notistack";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { APIError } from "./helpers/fetch";
import Auth from "./routes/Auth";

function App() {
  const router = createBrowserRouter([{ path: "/", element: <Auth /> }]);

  return (
    <SWRConfig
      value={{
        errorRetryCount: 0,
        onError: (err) => {
          if (err instanceof APIError) {
            enqueueSnackbar({
              message: `${err.info.msg}`,
              variant: "error",
            });
          } else if (err instanceof Error) {
            enqueueSnackbar({
              message: err.message,
              variant: "error",
            });
          }
        },
      }}
    >
      <SnackbarProvider
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        action={(key) => (
          <IconButton onClick={() => closeSnackbar(key)}>
            <CloseIcon />
          </IconButton>
        )}
      >
        <RouterProvider router={router} />
      </SnackbarProvider>
    </SWRConfig>
  );
}

export default App;
