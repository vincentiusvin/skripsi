import { createTheme } from "@mui/material";

declare module "@mui/material/IconButton" {
  interface IconButtonOwnProps {
    variant?: "text" | "outlined";
  }
}

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
          variant: "outlined",
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
      MuiLink: {
        styleOverrides: {
          root: {
            textDecoration: "none",
            color: "inherit",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          dense: {
            paddingLeft: 2,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            variants: [
              {
                props: { variant: "outlined" },
                style: {
                  borderWidth: "1px",
                },
              },
            ],
            color: (theme.vars || theme).palette.primary.main,
            borderStyle: "solid",
            borderRadius: theme.shape.borderRadius,
            borderColor: mode === "dark" ? theme.palette.primary.dark : theme.palette.primary.light,
            "&:hover": {
              borderColor:
                mode === "dark" ? theme.palette.primary.light : theme.palette.primary.main,
            },
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
    secondary: {
      main: "#e2e0f9",
    },
    background: {
      paper: "hsl(240, 5%, 10%)",
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
    secondary: {
      main: "#e2e0f9",
    },
    background: {
      default: "hsl(0, 0%, 99%)",
      paper: "hsl(220, 35%, 97%)",
    },
  },
  ...themeFactory("light"),
});
