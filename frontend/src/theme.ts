import { createTheme } from "@mui/material";

function themeFactory(): Parameters<typeof createTheme>[0] {
  return {
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: "Poppins",
    },
    components: {
      MuiPaper: {
        defaultProps: {
          elevation: 0,
          variant: "outlined",
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius,
            border: "1px solid ",
            borderColor: theme.palette.primary.dark,
            "&:hover": {
              borderColor: theme.palette.primary.light,
            },
            color: (theme.vars || theme).palette.primary.main,
          }),
        },
      },
    },
  };
}

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#B1A6FF",
    },
  },
  ...themeFactory(),
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#B1A6FF",
    },
    background: {
      paper: "hsl(220, 35%, 97%)",
    },
  },

  ...themeFactory(),
});
