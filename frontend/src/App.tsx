import { Snackbar } from "@mui/material";
import { useState } from "react";
import { SWRConfig } from "swr";
import "./App.css";
import Content from "./routes/Content";

function App() {
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <SWRConfig
      value={{
        errorRetryCount: 0,
        onError: (err) => {
          setErrorMessage(err.msg);
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
      />
      <Content />
    </SWRConfig>
  );
}

export default App;
