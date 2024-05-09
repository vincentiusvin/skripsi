import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { APIError } from "./helpers/fetch";
import Auth from "./routes/Auth";

function App() {
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = createBrowserRouter([{ path: "/", element: <Auth /> }]);

  return (
    <SWRConfig
      value={{
        errorRetryCount: 0,
        onError: (err) => {
          if (err instanceof APIError) {
            setErrorMessage(`${err.status} - ${err.info.msg}`);
          } else if (err instanceof Error) {
            setErrorMessage(`${err.message}`);
          }
          setErrorOpen(true);
        },
      }}
    >
      <Snackbar
        autoHideDuration={3000}
        anchorOrigin={{ horizontal: "center", vertical: "top" }}
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        message={errorMessage}
      >
        <Alert onClose={() => setErrorOpen(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      <RouterProvider router={router} />
    </SWRConfig>
  );
}

export default App;
