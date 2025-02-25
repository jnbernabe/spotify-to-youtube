import React, { useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { loginWithSpotify, loginWithYouTube } from "../api";
import { useNavigate } from "react-router-dom";

interface HomeProps {
  onLogin: (spotifyToken: string, youtubeToken: string) => void;
}

const Home: React.FC<HomeProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract tokens from URL hash
    const params = new URLSearchParams(window.location.hash.substring(1));
    const spotifyToken = params.get("access_token");
    const youtubeToken = params.get("youtube_access_token");
    const spotifyRefreshToken = params.get("spotify_refresh_token");
    const youtubeRefreshToken = params.get("youtube_refresh_token");
    const expiresIn = params.get("expires_in");

    if (spotifyToken && youtubeToken && spotifyRefreshToken && youtubeRefreshToken && expiresIn) {
      const expirationTime = Date.now() + Number(expiresIn) * 1000;

      // Store tokens in localStorage
      localStorage.setItem("spotify_access_token", spotifyToken);
      localStorage.setItem("youtube_access_token", youtubeToken);
      localStorage.setItem("spotify_refresh_token", spotifyRefreshToken);
      localStorage.setItem("youtube_refresh_token", youtubeRefreshToken);
      localStorage.setItem("spotify_token_expiry", expirationTime.toString());

      // Update App state
      onLogin(spotifyToken, youtubeToken);

      // Redirect to dashboard
      navigate("/dashboard");
    }
  }, [onLogin, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h4" gutterBottom>
        Welcome! Log in to Continue
      </Typography>

      <Button variant="contained" color="primary" onClick={loginWithSpotify} style={{ marginRight: "10px" }}>
        Login with Spotify
      </Button>

      <Button variant="contained" color="secondary" onClick={loginWithYouTube}>
        Login with YouTube
      </Button>
    </div>
  );
};

export default Home;
