import React from "react";
import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastStyles: ToastOptions = {
  theme: "dark",
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// ✅ Custom Toast Messages
export const showToast = (message: string, type: "success" | "error" | "info") => {
  const styleOverrides = {
    success: { background: "#1a1a1a", color: "#4CAF50" },
    error: { background: "#1a1a1a", color: "#FF5252" },
    info: { background: "#1a1a1a", color: "#2196F3" },
  };

  toast(message, {
    ...toastStyles,
    style: styleOverrides[type],
    closeButton: true,
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// ✅ Toast Component
const Toast = () => {
  return <ToastContainer />;
};

export default Toast;
