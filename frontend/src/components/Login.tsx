import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { loginWithSpotify } from "../api";

interface LoginProps {
  onLogin: (accessToken: string, refreshToken: string, expiresIn: number) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  useEffect(() => {
    // Extract tokens from URL hash
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");

    if (accessToken && refreshToken && expiresIn) {
      const expirationTime = Date.now() + Number(expiresIn) * 1000;
      onLogin(accessToken, refreshToken, expirationTime);
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
