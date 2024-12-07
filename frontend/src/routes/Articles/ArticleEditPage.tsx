import { AddAPhoto, Save } from "@mui/icons-material";
import { Avatar, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import RichEditor from "../../components/RichEditor";
import { fileToBase64DataURL } from "../../helpers/file";
import { handleOptionalStringUpdate } from "../../helpers/misc.ts";
import { useArticlesDetailGet, useArticlesDetailPut } from "../../queries/article_hooks";
import { useSessionGet } from "../../queries/sesssion_hooks.ts";

function ArticlesEdit(props: { article_id: number }) {
  const { article_id } = props;

  const { data: session_data } = useSessionGet();


  const { data: article_data } = useArticlesDetailGet({
    article_id,
  });

  const [articleName, setArticleName] = useState<string | undefined>();
  const [articleDescription, setArticleDescription] = useState<string | undefined>();
  const [articleContent, setArticleContent] = useState<string | undefined>();
  const [articleImage, setArticleImage] = useState<string | undefined>();
  const [, setLocation] = useLocation();

  const { mutate: editArticle } = useArticlesDetailPut({
    article_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Artikel Berhasil diUpdate!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation(`/articles/${article_id}`);
    },
  });

  if (!article_data) {
    return <Typography>Artikel tidak ditemukan!</Typography>;
  }

  function addArticle() {
    const user_id = session_data?.logged ? session_data.user_id : undefined;
    console.log("USER ID: ", user_id);

    if (!user_id) {
      return <Typography>Error: User not logged in!</Typography>;
    }

    editArticle({
      articles_name: articleName,
      articles_description: articleDescription,
      articles_content: articleContent,
      articles_image: handleOptionalStringUpdate(articleImage),
      articles_user_id: user_id,
    });
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Typography variant="h4" fontWeight="bold" align="center">
          Edit Article
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper sx={{ minHeight: 300 }}>
          <ImageDropzone
            sx={{ cursor: "pointer" }}
            onChange={async (file) => {
              const b64 = file ? await fileToBase64DataURL(file) : undefined;
              setArticleImage(b64);
            }}
          >
            {articleImage || article_data.articles_image ? (
              <Avatar
                src={articleImage || (article_data.articles_image ?? undefined)}
                variant="rounded"
                sx={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Stack alignItems="center" minHeight={250} justifyContent="center">
                <AddAPhoto sx={{ width: 100, height: 100 }} />
                <Typography textAlign="center">Drag or click here to upload an image!</Typography>
              </Stack>
            )}
          </ImageDropzone>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        <Stack spacing={4}>
          <TextField
            fullWidth
            onChange={(e) => setArticleName(e.target.value)}
            label="Article Name"
            value={articleName ?? article_data.articles_name}
          />
          <TextField
            fullWidth
            onChange={(e) => setArticleDescription(e.target.value)}
            label="Description"
            value={articleDescription ?? article_data.articles_description}
          />
        </Stack>
      </Grid>
      <Grid size={12}>
        <RichEditor
          label="Article Content"
          defaultValue={articleContent ?? article_data.articles_content}
          onBlur={(x) => setArticleContent(x)}
        />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => addArticle()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function ArticlesEditPage() {
  const { article_id: id } = useParams();
  const article_id = Number(id);
  console.log(`article_id from params: ${article_id}`);
  return <ArticlesEdit article_id={article_id} />;
}

export default ArticlesEditPage;
