import { createTheme } from "@mui/material/styles";

// ✅ Define the global theme
const theme = createTheme({
  palette: {
    mode: "dark", // ✅ Dark mode enabled
    primary: {
      main: "#00ff7f", // ✅ Green primary color
    },
    secondary: {
      main: "#1e90ff", // ✅ Blue secondary color
    },
    background: {
      default: "#121212", // ✅ Black background
      paper: "#1a1a1a", // ✅ Dark gray for cards
    },
    text: {
      primary: "#ffffff", // ✅ White text
      secondary: "#aaaaaa", // ✅ Light gray text
    },
  },
  typography: {
    fontFamily: `"Poppins", sans-serif`, // ✅ Modern font
    h4: {
      fontWeight: 700,
      color: "#00ff7f", // ✅ Green highlight
    },
    h6: {
      fontWeight: 500,
      color: "#1e90ff", // ✅ Blue accents for subtitles
    },
    body1: {
      fontSize: "1rem",
      color: "#ffffff", // ✅ White text for body
    },
    body2: {
      fontSize: "0.9rem",
      color: "#aaaaaa", // ✅ Slightly lighter text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // ✅ Rounded buttons
          fontWeight: 600,
          textTransform: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a", // ✅ Dark gray cards
          borderRadius: 10,
          boxShadow: "0px 4px 10px rgba(0, 255, 127, 0.2)", // ✅ Subtle green glow
        },
      },
    },
  },
});

export default theme;
