import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { loginWithSpotify } from "../api";

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  useEffect(() => {
    // Extract token from URL hash
    const params = new URLSearchParams(window.location.hash.substring(1));
    const token = params.get("access_token");

    if (token) {
      onLogin(token);
      localStorage.setItem("spotify_access_token", token); // Store token
      window.history.replaceState({}, document.title, "/dashboard"); // Clean URL
    }
  }, [onLogin]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login to Spotify</h2>
      <Button variant="contained" color="primary" onClick={loginWithSpotify}>
        Login with Spotify
      </Button>
    </div>
  );
};

export default Login;
