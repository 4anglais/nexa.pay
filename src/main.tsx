import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();
const fallback = document.getElementById("app-fallback");
const rootElement = document.getElementById("root");

try {
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  fallback?.remove();

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
} catch (error) {
  console.error("Failed to start NexaPayslips:", error);
}
