import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import "./index.css";

const CONTROL_API_BASE = (process.env.REACT_APP_AXION_CONTROL_URL || "https://api.axionenterprise.cloud/api").replace(/\/+$/, "");
const APP_ID = "annetom-site";

function trackErrorEvent(eventName, metadata = {}) {
  try {
    const body = {
      appId: APP_ID,
      eventType: "error",
      eventName,
      path: window.location.pathname,
      referrer: document.referrer || "",
      metadata,
    };
    fetch(`${CONTROL_API_BASE}/control/ingest/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {}
}

window.addEventListener("error", (event) => {
  trackErrorEvent("window_error", {
    message: String(event?.message || event?.error?.message || "window_error").slice(0, 500),
    stack: String(event?.error?.stack || "").slice(0, 1000),
    source: event?.filename || "",
    line: event?.lineno || null,
    column: event?.colno || null,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event?.reason;
  trackErrorEvent("unhandled_rejection", {
    message: String(reason?.message || reason || "unhandled_rejection").slice(0, 500),
    stack: String(reason?.stack || "").slice(0, 1000),
  });
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
