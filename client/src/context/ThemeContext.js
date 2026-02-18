import { createContext, useState, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const ThemeContext = createContext();

export const CustomThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#0e77e0ff" },
                secondary: { main: "#f50057" },
                background: { default: "#f5f5f5", paper: "#ffffff" },
                text: { primary: "#1a1a1a", secondary: "#555555" },
              }
            : {
                primary: { main: "#0d86e9ff" },
                secondary: { main: "#f48fb1" },
                background: {
                  default: "#0d1117",
                  paper: "linear-gradient(145deg, #1e1e1e, #121212)",
                },
                text: { primary: "#e0e0e0", secondary: "#aaaaaa" },
              }),
        },
        typography: {
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          h2: { fontWeight: 700, letterSpacing: "-1px" },
          h4: { fontWeight: 600 },
          button: { textTransform: "none", fontWeight: 600 },
        },
        shape: {
          borderRadius: 12, // rounded cards & buttons
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: "all 0.3s ease", // smooth theme transition
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
