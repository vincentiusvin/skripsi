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
import { Link, useLocation, useParams } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import { APIError } from "../../helpers/fetch";
import { fileToBase64DataURL } from "../../helpers/file";
import { useOrgsCategoriesGet, useOrgsUpdate } from "../../queries/org_hooks";

function OrgsEditPage() {
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgImage, setOrgImage] = useState<string | null>(null);
  const [orgCategory, setOrgCategory] = useState<number | null>(null);

  const [, setLocation] = useLocation();

  const { id } = useParams();
  console.log("id: ", id);

  const { mutate: editOrg } = useOrgsUpdate({
    id: Number(id),
    name: orgName,
    desc: orgDesc,
    address: orgAddress,
    phone: orgPhone,
    categories: orgCategory != null ? [orgCategory] : [],
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Edit successful!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/orgs");
    },
  });

  // Fetch categories from the backend API
  const { data: categories } = useOrgsCategoriesGet({
    retry: (failureCount, error) => {
      if ((error instanceof APIError && error.status === 401) || failureCount > 3) {
        setLocation("/");
        return false;
      }
      return true;
    },
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
          Edit Organisasi
        </Typography>
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => editOrg()}>
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

export default OrgsEditPage;
