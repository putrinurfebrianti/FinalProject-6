import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { HelmetProvider } from "react-helmet-async"; 

import App from "./App";
import axios from 'axios';
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; 

import "./index.css"; 
import "flatpickr/dist/flatpickr.css";

const savedToken = sessionStorage.getItem('token') ?? localStorage.getItem('token');
axios.defaults.baseURL = 'http://127.0.0.1:8000/api';
if (savedToken) axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <HelmetProvider>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  </React.StrictMode>
);