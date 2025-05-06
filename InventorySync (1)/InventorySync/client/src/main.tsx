import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set document title
document.title = "Program Management and Tracking";

createRoot(document.getElementById("root")!).render(<App />);
