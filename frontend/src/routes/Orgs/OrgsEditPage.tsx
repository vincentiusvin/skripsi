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
  Skeleton,
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
import { useOrgDetailGet, useOrgsCategoriesGet, useOrgsUpdate } from "../../queries/org_hooks";

function OrgsEditPage() {
  const [orgName, setOrgName] = useState<string | undefined>(undefined);
  const [orgDesc, setOrgDesc] = useState<string | undefined>(undefined);
  const [orgAddress, setOrgAddress] = useState<string | undefined>(undefined);
  const [orgPhone, setOrgPhone] = useState<string | undefined>(undefined);
  const [orgImage, setOrgImage] = useState<string | undefined>(undefined);
  const [orgCategory, setOrgCategory] = useState<number[] | undefined>(undefined);
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: org_data } = useOrgDetailGet({
    id: Number(id),
  });

  const { mutate: editOrg } = useOrgsUpdate({
    id: Number(id),
    name: orgName,
    desc: orgDesc,
    address: orgAddress,
    phone: orgPhone,
    categories: orgCategory,
    image: orgImage,
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

  if (org_data == undefined) {
    return <Skeleton />;
  }

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
              const b64 = file ? await fileToBase64DataURL(file) : undefined;
              setOrgImage(b64);
            }}
          >
            {orgImage || org_data.org_image ? (
              <Avatar
                src={orgImage || (org_data.org_image ?? undefined)}
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
            defaultValue={org_data?.org_name}
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgDesc(e.target.value)}
            label="Description"
            defaultValue={org_data?.org_description}
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgAddress(e.target.value)}
            label="Address"
            defaultValue={org_data?.org_address}
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgPhone(e.target.value)}
            label="Phone"
            defaultValue={org_data?.org_phone}
          ></TextField>
          <FormControl>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              onChange={(e) => setOrgCategory(e.target.value as number[])}
              label="Category"
              multiple
              value={orgCategory}
              defaultValue={org_data.org_categories.map((x) => x.category_id)}
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
