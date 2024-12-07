import { AddAPhoto, Save } from "@mui/icons-material";
import { Avatar, Button, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { Redirect, useLocation, useParams } from "wouter";
import ImageDropzone from "../../components/Dropzone";
import RichEditor from "../../components/RichEditor";
import { fileToBase64DataURL } from "../../helpers/file";
import { handleOptionalStringUpdate } from "../../helpers/misc.ts";
import { useArticlesDetailGet, useArticlesDetailPut } from "../../queries/article_hooks";

function ArticlesEdit(props: { article_id: number }) {
  const { article_id } = props;
  const { data: article_data } = useArticlesDetailGet({
    article_id,
  });

  const [articleName, setArticleName] = useState<string | undefined>();
  const [articleDescription, setArticleDescription] = useState<string | undefined>();
  const [articleContent, setArticleContent] = useState<string | undefined>();
  const [articleImage, setArticleImage] = useState<string | undefined>();
  const [, setLocation] = useLocation();

  const { mutate: _editArticle } = useArticlesDetailPut({
    article_id,
    onSuccess: () => {
      enqueueSnackbar({
        message: <Typography>Artikel berhasil diubah!</Typography>,
        autoHideDuration: 5000,
        variant: "success",
      });
      setLocation(`/articles/${article_id}`);
    },
  });

  if (!article_data) {
    return <Skeleton />;
  }

  function editArticle() {
    _editArticle({
      name: articleName,
      description: articleDescription,
      content: articleContent,
      image: handleOptionalStringUpdate(articleImage),
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
            {articleImage || article_data.image ? (
              <Avatar
                src={articleImage || (article_data.image ?? undefined)}
                variant="rounded"
                sx={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Stack alignItems="center" minHeight={250} justifyContent="center">
                <AddAPhoto sx={{ width: 100, height: 100 }} />
                <Typography textAlign="center">
                  Tarik atau tekan di sini untuk mengupload gambar!
                </Typography>
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
            value={articleName ?? article_data.name}
          />
          <TextField
            fullWidth
            onChange={(e) => setArticleDescription(e.target.value)}
            label="Description"
            value={articleDescription ?? article_data.description}
          />
        </Stack>
      </Grid>
      <Grid size={12}>
        <RichEditor
          label="Article Content"
          defaultValue={articleContent ?? article_data.content}
          onBlur={(x) => setArticleContent(x)}
        />
      </Grid>
      <Grid size={12}>
        <Button variant="contained" fullWidth endIcon={<Save />} onClick={() => editArticle()}>
          Simpan
        </Button>
      </Grid>
    </Grid>
  );
}

function ArticlesEditPage() {
  const { article_id: id } = useParams();
  const article_id = Number(id);
  if (Number.isNaN(article_id)) {
    return <Redirect to="/articles" />;
  }
  return <ArticlesEdit article_id={article_id} />;
}

export default ArticlesEditPage;
