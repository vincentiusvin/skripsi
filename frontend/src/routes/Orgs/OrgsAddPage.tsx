import { AddAPhoto, Save } from "@mui/icons-material";
import {
  Avatar,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { MuiTelInput } from "mui-tel-input";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Redirect, useLocation } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import RichEditor from "../../components/RichEditor.tsx";
import { fileToBase64DataURL } from "../../helpers/file";
import { useOrgsCategoriesGet, useOrgsPost } from "../../queries/org_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

function OrgsAdd() {
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

  const { data: categories } = useOrgsCategoriesGet({});

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
          <MuiTelInput
            fullWidth
            onChange={(_, i) => {
              setOrgPhone(i.numberValue ?? "");
            }}
            required
            value={orgPhone}
            defaultCountry="ID"
            label="Nomor Telepon"
          ></MuiTelInput>
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

function OrgsAddPage() {
  const { data: session } = useSessionGet();
  if (session == undefined) {
    return <Skeleton />;
  }
  if (!session.logged) {
    return <Redirect to={"/orgs"} />;
  }
  return <OrgsAdd />;
}

export default OrgsAddPage;
