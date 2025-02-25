import React, { useEffect } from "react";
import { Button } from "@mui/material";
import { loginWithSpotify, loginWithYouTube } from "../api";

interface LoginProps {
  onLogin: (spotifyToken: string, youtubeToken: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const spotifyToken = params.get("access_token");
    const youtubeToken = params.get("youtube_access_token");

    if (spotifyToken && youtubeToken) {
      onLogin(spotifyToken, youtubeToken);
      localStorage.setItem("spotify_access_token", spotifyToken);
      localStorage.setItem("youtube_access_token", youtubeToken);
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, [onLogin]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login to Spotify and YouTube</h2>
      <Button variant="contained" color="primary" onClick={loginWithSpotify}>
        Login with Spotify
      </Button>
      <Button variant="contained" color="secondary" onClick={loginWithYouTube} style={{ marginLeft: "10px" }}>
        Login with YouTube
      </Button>
    </div>
  );
};

export default Login;
