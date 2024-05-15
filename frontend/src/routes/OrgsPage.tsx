import {
  Button,
  Stack,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { APIContext } from "../helpers/fetch";

function OrgsPage() {
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");

  const { trigger: addOrg } = useSWRMutation("/api/orgs", (url) =>
    new APIContext("PostOrgs").fetch(url, {
      method: "POST",
      body: {
        org_name: orgName,
        org_description: orgDesc,
      },
    })
  );

  const { data } = useSWR("/api/orgs", new APIContext("GetOrgs").fetch);

  return (
    <Stack spacing={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Description</TableCell>
          </TableRow>
        </TableHead>
        {data?.map((x) => (
          <TableRow>
            <TableCell>{x.org_name}</TableCell>
            <TableCell>{x.org_description}</TableCell>
          </TableRow>
        ))}
      </Table>

      <Typography variant="h4" fontWeight={"bold"} align="center">
        Insert Organization
      </Typography>
      <TextField
        fullWidth
        onChange={(e) => setOrgName(e.target.value)}
        label="Name"
        sx={{ display: "block" }}
      ></TextField>
      <TextField
        fullWidth
        onChange={(e) => setOrgDesc(e.target.value)}
        label="Description"
        sx={{ display: "block" }}
      ></TextField>
      <Button
        variant="contained"
        onClick={() =>
          addOrg().then((x) => {
            enqueueSnackbar({
              message: <Typography>{x.msg}</Typography>,
              variant: "success",
            });
          })
        }
      >
        Tambah Organisasi
      </Button>
    </Stack>
  );
}

export default OrgsPage;
