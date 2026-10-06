import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId="961312734427-8358sdlkaigrkh5vqvq6t9t3rtbdpe10.apps.googleusercontent.com"
    >
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);