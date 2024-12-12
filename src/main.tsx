import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClientProvider } from "@tanstack/react-query";

import { Home } from "./pages/home/page.tsx";
import { loader as homeLoader } from "./pages/home/loader.tsx";

import { AppError } from "./error.tsx";

import {
  Login,
  loader as loginLoader,
  action as loginAction,
} from "./pages/login/page.tsx";

import { queryClient } from "./common/query-client.ts";

import { Root } from "./root";

import {
  ChangePassword,
  action as changePasswordAction,
} from "./pages/change-password/page.tsx";

const theme = extendTheme({
  colors: {
    brand: {
      900: "var(--brand)",
    },
  },
  fonts: {
    heading: "var(--font-mtn)",
    body: "var(--font-mtn)",
  },
  components: {
    Button: {
      variants: {
        solid: {
          bg: "brand.900",
          rounded: 4,
          color: "white",
        },
        
        outline: {
          rounded: 4,
          borderColor: "gray.400",
        },
      },
    },
    Input: {
      variants: {
        filled: {
          borderColor: "gray.900",
        },
      },
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <AppError />,
    children: [
      {
        index: true,
        element: <Home />,
        loader: homeLoader,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
    loader: loginLoader,
    action: loginAction,
    errorElement: <AppError />,
  },
  {
    path: "/change-password",
    element: <ChangePassword />,
    action: changePasswordAction,
    errorElement: <AppError />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme} toastOptions={{ defaultOptions: { position: 'top-right' } }}>
        <RouterProvider router={router} />
      </ChakraProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
