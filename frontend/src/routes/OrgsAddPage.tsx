import { AddAPhoto, ArrowBack, Save } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import ImageDropzone from "../components/Dropzone";
import { APIContext } from "../helpers/fetch";
import { fileToBase64DataURL } from "../helpers/file";
import { queryClient } from "../helpers/queryclient";

function OrgsAddPage() {
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgImage, setOrgImage] = useState<string | null>(null);

  const [, setLocation] = useLocation();

  const { mutate: addOrg } = useMutation({
    mutationKey: ["session"],
    mutationFn: () =>
      new APIContext("PostOrgs").fetch("/api/orgs", {
        method: "POST",
        body: {
          org_name: orgName,
          org_description: orgDesc,
          org_address: orgAddress,
          org_phone: orgPhone,
          ...(orgImage && { org_image: orgImage }),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgs"] });
      enqueueSnackbar({
        message: <Typography>Added successful!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/");
    },
  });

  // const handleChange = (event: SelectChangeEvent) => {
  //   setAge(event.target.value as string);
  // };

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
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addOrg()}>
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
                <Typography>Drag and Drop or Click to upload an image!</Typography>
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
          <Select
            // value={age}
            label="Test"

            // onChange={handleChange}
          >
            <MenuItem value={10}>Ten</MenuItem>
            <MenuItem value={20}>Twenty</MenuItem>
            <MenuItem value={30}>Thirty</MenuItem>
          </Select>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default OrgsAddPage;
