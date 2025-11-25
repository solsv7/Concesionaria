// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111111",      
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#757575",      
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f5f5",   
      paper: "#ffffff",     
    },
    text: {
      primary: "#111111",
      secondary: "#5f6368",
    },
    divider: "#e0e0e0",
  },

  typography: {
    fontFamily:
      '"Poppins", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: "2.4rem",
      letterSpacing: "-0.04em",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
      letterSpacing: "-0.03em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1.05rem",
      letterSpacing: "0.03em",
    },
    body1: {
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.85rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.04em",
      fontSize: "0.85rem",
    },
  },

  shape: {
    borderRadius: 14, 
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f5f5f5",
        },
        "*::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },
        "*::-webkit-scrollbar-thumb": {
          borderRadius: 999,
          backgroundColor: "#bdbdbd",
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: "transparent",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          backgroundColor: "#111111",
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 56,
          "@media (min-width:600px)": {
            minHeight: 64,
          },
          paddingInline: 16,
          "@media (min-width:900px)": {
            paddingInline: 24,
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 12px 40px rgba(15,15,15,0.06)",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          padding: 16,
          "@media (min-width:900px)": {
            padding: 20,
          },
        },
      },
    },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          paddingBlock: 8,
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.85rem",
          letterSpacing: "0.06em",
        },
        sizeSmall: {
          paddingInline: 14,
          paddingBlock: 6,
          fontSize: "0.8rem",
        },
        containedPrimary: {
          backgroundColor: "#111111",
          "&:hover": {
            backgroundColor: "#000000",
          },
        },
        outlinedPrimary: {
          borderColor: "#111111",
          color: "#111111",
          "&:hover": {
            borderColor: "#000000",
            backgroundColor: "#f0f0f0",
          },
        },
        textPrimary: {
          color: "#111111",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)",
          },
        },
      },
    },

    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 999,
            backgroundColor: "#fafafa",
            "& fieldset": {
              borderColor: "#e0e0e0",
            },
            "&:hover fieldset": {
              borderColor: "#bdbdbd",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#111111",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
            },
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.85rem",
          },
        },
      },
    },

    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 999,
          backgroundColor: "#fafafa",
        },
        icon: {
          color: "#757575",
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f0f0f0",
          "& .MuiTableCell-root": {
            fontWeight: 600,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#5f6368",
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: "#eeeeee",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: 8,
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)",
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 999,
          backgroundColor: "#111111",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.9rem",
          "&.Mui-selected": {
            color: "#111111",
          },
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 999,
          paddingInline: 10,
          paddingBlock: 6,
          fontSize: "0.75rem",
          backgroundColor: "#111111",
        },
        arrow: {
          color: "#111111",
        },
      },
    },
  },
});

export default theme;
