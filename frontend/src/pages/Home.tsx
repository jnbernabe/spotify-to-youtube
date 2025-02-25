import React, { useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { loginWithSpotify } from "../api";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  onLogin: (spotifyToken: string) => void;
}

const Home: React.FC<HomeProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract Spotify token from URL hash
    const params = new URLSearchParams(window.location.hash.substring(1));
    const spotifyToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = params.get("expires_in");

    if (spotifyToken && refreshToken && expiresIn) {
      const expirationTime = Date.now() + Number(expiresIn) * 1000;

      // Store Spotify token and refresh token in localStorage
      localStorage.setItem("spotify_access_token", spotifyToken);
      localStorage.setItem("spotify_refresh_token", refreshToken);
      localStorage.setItem("spotify_token_expiry", expirationTime.toString());

      // Update App state
      onLogin(spotifyToken);

      // Redirect to Dashboard
      navigate("/dashboard");
    }
  }, [onLogin, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        Welcome! Log in to Continue
      </Typography>

      <Button variant="contained" color="primary" onClick={loginWithSpotify}>
        Login with Spotify
      </Button>
    </div>
  );
};

export default Home;
