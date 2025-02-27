import { ToastContainer, toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastStyles: ToastOptions = {
  theme: "dark",
  position: "bottom-right",
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

// ✅ Custom Toast Messages
export const showToast = (message: string, type: "success" | "error" | "info", timeout: number = 2000) => {
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
    autoClose: timeout,
    hideProgressBar: false,
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
