import './index.css';
import { render } from "react-dom";
import { App } from "./App";
import { BrowserRouter } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

render(
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>,
  document.getElementById("root")
);