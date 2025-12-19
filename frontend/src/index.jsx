import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BusListProvider } from "./context/busdetails";
import { SelectedBusProvider } from "./context/selectedbus";
import { QueryProvider } from "./context/QueryProvider";
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <QueryProvider>
      <BusListProvider>
        <SelectedBusProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </SelectedBusProvider>
      </BusListProvider>
    </QueryProvider>
  </React.StrictMode>
);
