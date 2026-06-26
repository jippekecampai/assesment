import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./global.css";

import { campaiTheme } from "./lib/campai-theme";
import { App } from "./App";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorSchemeScript defaultColorScheme="light" />
    <MantineProvider theme={campaiTheme} defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-right" />
        <App />
      </QueryClientProvider>
    </MantineProvider>
  </StrictMode>,
);
