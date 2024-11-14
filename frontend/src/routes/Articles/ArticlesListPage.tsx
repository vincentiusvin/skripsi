import React from "react";

import AddIcon from "@mui/icons-material/Add";
import { Card, CardContent, Container, Fab, Grid, Typography } from "@mui/material";
import { useArticlesGet } from "../../queries/article_hooks";

type Article = {
  article_id: number;
  user_id: number;
  article_name: string;
  article_description: string;
};

const ArticlesHomePage: React.FC = () => {
  const { data: articles, isLoading, error } = useArticlesGet();

  const handleAddArticle = () => {
    // Redirect or open modal for adding a new article
    console.log("Add new article");
  };

  if (isLoading) return <Typography>Loading articles...</Typography>;
  if (error) return <Typography>Error loading articles.</Typography>;

  return (
    <Container maxWidth="lg" sx={{ position: "relative", paddingBottom: "4rem" }}>
      <Typography variant="h4" gutterBottom>
        Articles
      </Typography>
      <Grid container spacing={3}>
        {articles?.map((article: Article) => (
          <Grid item xs={12} sm={6} md={4} key={article.article_id}>
            <Card
              variant="outlined"
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardContent>
                <Typography variant="h6" component="div" gutterBottom color="primary">
                  {article.article_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {article.article_description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Floating Action Button for Adding New Article */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddArticle}
        sx={{
          position: "fixed",
          top: 100,
          right: 16,
        }}
      >
        <AddIcon />
        ADD
      </Fab>
    </Container>
  );
};

export default ArticlesHomePage;
