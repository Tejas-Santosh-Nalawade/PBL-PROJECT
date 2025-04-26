import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Create an instance of ClerkProvider and wrap the application
// This enables authentication across the app
createRoot(document.getElementById("root")!).render(<App />);
