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
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import MarkdownEditor from "../../components/MarkdownEditor/index.tsx";
import { fileToBase64DataURL } from "../../helpers/file";
import { useOrgDetailGet, useOrgsCategoriesGet, useOrgsUpdate } from "../../queries/org_hooks";
import AuthorizeOrgs from "./components/AuthorizeOrgs.tsx";

function OrgsEdit(props: { org_id: number }) {
  const { org_id } = props;
  const [orgName, setOrgName] = useState<string | undefined>(undefined);
  const [orgDesc, setOrgDesc] = useState<string | undefined>(undefined);
  const [orgAddress, setOrgAddress] = useState<string | undefined>(undefined);
  const [orgPhone, setOrgPhone] = useState<string | undefined>(undefined);
  const [orgImage, setOrgImage] = useState<string | undefined>(undefined);
  const [orgCategory, setOrgCategory] = useState<number[] | undefined>(undefined);
  const [, setLocation] = useLocation();

  const { data: org_data } = useOrgDetailGet({
    id: org_id,
  });

  const { mutate: editOrg } = useOrgsUpdate({
    id: org_id,
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
      setLocation(`/orgs/${org_id}`);
    },
  });

  const { data: categories } = useOrgsCategoriesGet({});

  if (org_data == undefined) {
    return <Skeleton />;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography
          variant="h4"
          fontWeight={"bold"}
          align="center"
          sx={{
            wordBreak: "break-word",
          }}
        >
          Edit Organisasi
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
            label="Name"
            value={orgName ?? org_data.org_name}
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgAddress(e.target.value)}
            label="Address"
            value={orgAddress ?? org_data.org_address}
          ></TextField>
          <TextField
            fullWidth
            onChange={(e) => setOrgPhone(e.target.value)}
            label="Phone"
            value={orgPhone ?? org_data.org_phone}
          ></TextField>
          <FormControl>
            <InputLabel>Category</InputLabel>
            <Select
              onChange={(e) => setOrgCategory(e.target.value as number[])}
              label="Category"
              multiple
              value={orgCategory ?? org_data.org_categories.map((x) => x.category_id)}
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
        <Typography>Tentang Organisasi</Typography>
        <MarkdownEditor
          oldValue={orgDesc ?? org_data.org_description}
          onChange={(x) => setOrgDesc(x)}
        ></MarkdownEditor>
      </Grid>
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => editOrg()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function OrgsEditPage() {
  const { org_id: id } = useParams();
  const org_id = Number(id);

  return (
    <AuthorizeOrgs allowedRoles={["Admin"]}>
      <OrgsEdit org_id={org_id} />
    </AuthorizeOrgs>
  );
}

export default OrgsEditPage;
