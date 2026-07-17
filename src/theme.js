import { createTheme } from "@mui/material/styles";

export const adminTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#818cf8" },
    secondary: { main: "#22d3ee" },
    background: {
      default: "#070b14",
      paper: "#0f1628",
    },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error: { main: "#ef4444" },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", system-ui, sans-serif',
    h4: { fontWeight: 800, letterSpacing: "-0.03em" },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          backgroundImage: "none",
          borderColor: "rgba(148, 163, 184, 0.16)",
        },
      },
    },
  },
});
