import { AddAPhoto, Save } from "@mui/icons-material";
import { Avatar, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import RichEditor from "../../components/RichEditor.tsx";
import { fileToBase64DataURL } from "../../helpers/file";
import { useArticlesPost } from "../../queries/article_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

function ArticleAddPage() {
  const [articleName, setArticleName] = useState("");
  const [articleDescription, setArticleDescription] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleImage, setArticleImage] = useState<string | undefined>();
  // Replace with actual user ID from auth context

  const [, setLocation] = useLocation();
  const { data: session } = useSessionGet();

  const user_id: number | undefined = session?.logged ? session.user_id : undefined;

  const { mutate: articlesPost } = useArticlesPost({
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
    if (!user_id) {
      enqueueSnackbar({
        message: <Typography>Anda harus login terlebih dahulu.</Typography>,
        autoHideDuration: 5000,
        variant: "error",
      });
      setLocation("/landing"); // Redirect to login page
      return;
    }

    articlesPost({
      articles_name: articleName,
      articles_description: articleDescription,
      articles_content: articleContent,
      articles_user_id: user_id,
      articles_image: articleImage,
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h4" fontWeight="bold" align="center">
          Tambah Artikel
        </Typography>
      </Grid>
      <Grid item xs={12} md={4}>
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
      <Grid item xs={12} md={8}>
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
            label="Deskripsi Artikel"
          />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <RichEditor
          label="Isi Artikel"
          defaultValue={articleContent}
          onBlur={(content) => setArticleContent(content)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addArticle()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

export default ArticleAddPage;
