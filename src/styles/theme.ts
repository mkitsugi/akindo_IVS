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
    footer: "'Roboto', sans-serif",
    kumbh: "'Kumbh Sans', sans-serif",
    gothic: "'Gothic A1', sans-serif",
    inter: "'Inter', sans-serif",
  },
  fontWeights: {
    weight400: 400,
    weight500: 500,
    weight600: 600,
    weight700: 700,
    weight900: 900,
  },
});
