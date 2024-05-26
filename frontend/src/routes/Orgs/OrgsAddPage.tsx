import { AddAPhoto, ArrowBack, Save } from "@mui/icons-material";
import {
  Avatar,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import { APIError } from "../../helpers/fetch";
import { fileToBase64DataURL } from "../../helpers/file";
import { useOrgsCategoriesGet, useOrgsPost } from "../../queries/org_hooks";

function OrgsAddPage() {
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgImage, setOrgImage] = useState<string | null>(null);
  const [orgCategory, setOrgCategory] = useState<number | "">("");

  const [, setLocation] = useLocation();

  const { mutate: addOrg } = useOrgsPost({
    name: orgName,
    desc: orgDesc,
    address: orgAddress,
    phone: orgPhone,
    category: Number(orgCategory),
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Added successful!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
    },
  });

  // Fetch categories from the backend API
  const { data: categories } = useOrgsCategoriesGet((failureCount, error) => {
    if ((error instanceof APIError && error.status === 401) || failureCount > 3) {
      setLocation("/");
      return false;
    }
    return true;
  });

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
          <FormControl>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={orgCategory}
              onChange={(e) => setOrgCategory(Number(e.target.value))}
              label="Category"
            >
              {categories &&
                categories.map((category) => (
                  <MenuItem key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default OrgsAddPage;
