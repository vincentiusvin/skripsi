import { createTheme } from "@mui/material";

function themeFactory(mode: "dark" | "light"): Parameters<typeof createTheme>[0] {
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
        },
      },
      MuiCard: {
        defaultProps: {
          elevation: 0,
        },
      },
      MuiAppBar: {
        defaultProps: {
          elevation: 0,
        },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.default,
          }),
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius,
            border: "1px solid ",
            borderColor: mode === "dark" ? theme.palette.primary.dark : theme.palette.primary.light,
            "&:hover": {
              borderColor:
                mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main,
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
  ...themeFactory("dark"),
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
  ...themeFactory("light"),
});
