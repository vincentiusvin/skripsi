import { AddAPhoto, ArrowBack, Save } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { Link } from "wouter";
import ImageDropzone from "../components/Dropzone";
import { APIContext } from "../helpers/fetch";
import { fileToBase64DataURL } from "../helpers/file";

function OrgsAddPage() {
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgImage, setOrgImage] = useState<string | null>(null);

  const { trigger: addOrg } = useSWRMutation("/api/orgs", (url) =>
    new APIContext("PostOrgs").fetch(url, {
      method: "POST",
      body: {
        org_name: orgName,
        org_description: orgDesc,
        org_address: orgAddress,
        org_phone: orgPhone,
        ...(orgImage && { org_image: orgImage }),
      },
    })
  );

  return (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={2}>
        <Link to={"/orgs"}>
          <Button startIcon={<ArrowBack />} variant="contained" fullWidth>
            Kembali
          </Button>
        </Link>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Tambah Organisasi
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Button
          variant="contained"
          fullWidth
          endIcon={<Save />}
          onClick={() =>
            addOrg().then((x) => {
              enqueueSnackbar({
                message: <Typography>{x.msg}</Typography>,
                variant: "success",
              });
            })
          }
        >
          Simpan
        </Button>
      </Grid>
      <Grid item xs={4}>
        <Paper sx={{ minHeight: 300 }}>
          <ImageDropzone
            sx={{
              cursor: "pointer",
            }}
            onChange={async (file) => {
              console.log(file);
              const b64 = file ? await fileToBase64DataURL(file) : null;
              setOrgImage(b64);
            }}
          >
            {orgImage ? (
              <Avatar
                src={orgImage}
                variant="rounded"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              ></Avatar>
            ) : (
              <Stack
                alignItems={"center"}
                minHeight={250}
                justifyContent={"center"}
                sx={{
                  cursor: "pointer",
                }}
              >
                <AddAPhoto
                  sx={{
                    width: 100,
                    height: 100,
                  }}
                />
                <Typography>
                  Drag and Drop or Click to upload an image!
                </Typography>
              </Stack>
            )}
          </ImageDropzone>
        </Paper>
      </Grid>
      <Grid item xs={8}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            onChange={(e) => setOrgName(e.target.value)}
            label="Name"
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgDesc(e.target.value)}
            label="Description"
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgAddress(e.target.value)}
            label="Address"
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgPhone(e.target.value)}
            label="Phone"
          ></TextField>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default OrgsAddPage;
