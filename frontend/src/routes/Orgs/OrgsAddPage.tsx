import { AddAPhoto, Save } from "@mui/icons-material";
import {
  Avatar,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import RichEditor from "../../components/RichEditor.tsx";
import { APIError } from "../../helpers/fetch";
import { fileToBase64DataURL } from "../../helpers/file";
import { useOrgsCategoriesGet, useOrgsPost } from "../../queries/org_hooks";

function OrgsAddPage() {
  const [orgName, setOrgName] = useState("");
  const [orgDesc, setOrgDesc] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgImage, setOrgImage] = useState<string | undefined>();
  const [orgCategory, setOrgCategory] = useState<number[] | undefined>();

  const [, setLocation] = useLocation();

  const { mutate: orgsPost } = useOrgsPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Organisasi berhasil ditambahkan!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/orgs");
    },
  });

  function addOrg() {
    orgsPost({
      org_name: orgName,
      org_address: orgAddress,
      org_categories: orgCategory,
      org_phone: orgPhone,
      org_description: orgDesc,
      org_image: orgImage,
    });
  }

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
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight={"bold"} align="center">
          Tambah Organisasi
        </Typography>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 4,
        }}
      >
        <Paper sx={{ minHeight: 300 }}>
          <ImageDropzone
            sx={{
              cursor: "pointer",
            }}
            onChange={async (file) => {
              const b64 = file ? await fileToBase64DataURL(file) : null;
              setOrgImage(b64 ?? undefined);
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
                <Typography textAlign={"center"}>
                  Tarik atau tekan di sini untuk mengupload gambar!
                </Typography>
              </Stack>
            )}
          </ImageDropzone>
        </Paper>
      </Grid>
      <Grid
        size={{
          xs: 12,
          md: 8,
        }}
      >
        <Stack spacing={4}>
          <TextField
            fullWidth
            onChange={(e) => setOrgName(e.target.value)}
            required
            label="Nama Organisasi"
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgAddress(e.target.value)}
            required
            label="Alamat"
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgPhone(e.target.value)}
            required
            label="Nomor Telepon"
          ></TextField>
          <FormControl>
            <InputLabel>Kategori</InputLabel>
            <Select
              value={orgCategory ?? []}
              multiple
              onChange={(e) => setOrgCategory(e.target.value as number[])}
              label="Kategori"
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
      <Grid size={12}>
        <RichEditor
          label={"Tentang Organisasi"}
          defaultValue={orgDesc}
          onBlur={(x) => setOrgDesc(x)}
        ></RichEditor>
      </Grid>
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addOrg()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

export default OrgsAddPage;
