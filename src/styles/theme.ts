import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    footer: {
      bg: "#000000",
      font: "#ffffff",
    },
    header: {
      font: "#000000",
    },
    orange: "#FF7940",
    "light-gray": "#333333",
  },
  fonts: {
    body: "MyFont, system-ui, sans-serif",
    heading: "MyFont, Arial, sans-serif",
    mono: "MyFont, monospace",
  },
  fontWeights: {
    weight400: 400,
    weight500: 500,
    weight600: 600,
    weight700: 700,
    weight900: 900,
  },
});

export default theme;
