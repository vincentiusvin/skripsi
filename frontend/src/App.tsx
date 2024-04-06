import { Alert, Snackbar } from "@mui/material";
import { useState } from "react";
import { SWRConfig } from "swr";
import "./App.css";
import { APIError } from "./helpers/fetch";
import Content from "./routes/Content";

function App() {
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      <Content />
    </SWRConfig>
  );
}

export default App;
