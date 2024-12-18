import { AddAPhoto, Save } from "@mui/icons-material";
import { Avatar, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import RichEditor from "../../components/RichEditor.tsx";
import { fileToBase64DataURL } from "../../helpers/file";
import { useArticlesPost } from "../../queries/article_hooks";

function ArticleAdd() {
  const [articleName, setArticleName] = useState("");
  const [articleDescription, setArticleDescription] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleImage, setArticleImage] = useState<string | undefined>();

  const [, setLocation] = useLocation();

  const { mutate: _addArticle } = useArticlesPost({
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Artikel berhasil ditambahkan!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation("/articles");
    },
  });

  function addArticle() {
    _addArticle({
      name: articleName,
      description: articleDescription,
      content: articleContent,
      image: articleImage,
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h4" fontWeight="bold" align="center">
          Tambah Artikel
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
            sx={{ cursor: "pointer" }}
            onChange={async (file) => {
              const b64 = file ? await fileToBase64DataURL(file) : null;
              setArticleImage(b64 ?? undefined);
            }}
          >
            {articleImage ? (
              <Avatar src={articleImage} variant="rounded" sx={{ width: "100%", height: "100%" }} />
            ) : (
              <Stack
                alignItems="center"
                minHeight={250}
                justifyContent="center"
                sx={{ cursor: "pointer" }}
              >
                <AddAPhoto sx={{ width: 100, height: 100 }} />
                <Typography textAlign="center">
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
          md: 4,
        }}
      >
        <Stack spacing={4}>
          <TextField
            fullWidth
            onChange={(e) => setArticleName(e.target.value)}
            required
            label="Judul Artikel"
          />
          <TextField
            fullWidth
            onChange={(e) => setArticleDescription(e.target.value)}
            required
            label="Deskripsi Singkat"
          />
        </Stack>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <RichEditor
          label="Isi Artikel *"
          defaultValue={articleContent}
          onBlur={(content) => setArticleContent(content)}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addArticle()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function ArticleAddPage() {
  return <ArticleAdd />;
}

export default ArticleAddPage;
