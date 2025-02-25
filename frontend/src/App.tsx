import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // ✅ Import the custom theme
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { refreshSpotifyToken, refreshYouTubeToken } from "./api";
import { showToast } from "./components/Toast";
import Toast from "./components/Toast";

const App: React.FC = () => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(localStorage.getItem("spotify_access_token"));
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(localStorage.getItem("spotify_refresh_token"));
  const [spotifyExpiration, setSpotifyExpiration] = useState<number | null>(localStorage.getItem("spotify_token_expiry") ? Number(localStorage.getItem("spotify_token_expiry")) : null);
  const [youtubeToken, setYouTubeToken] = useState<string | null>(localStorage.getItem("youtube_access_token"));
  const [youtubeRefreshToken, setYouTubeRefreshToken] = useState<string | null>(localStorage.getItem("youtube_refresh_token"));

  useEffect(() => {
    // ✅ Extract YouTube token from URL query string (`?youtube_access_token=XYZ`)
    const urlParams = new URLSearchParams(window.location.search);
    const newYouTubeToken = urlParams.get("youtube_access_token");
    const newYouTubeRefreshToken = urlParams.get("youtube_refresh_token");

    if (newYouTubeToken && newYouTubeRefreshToken) {
      //console.log("✅ YouTube Token Found:", newYouTubeToken);

      setYouTubeToken(newYouTubeToken);
      localStorage.setItem("youtube_access_token", newYouTubeToken);
      localStorage.setItem("youtube_refresh_token", newYouTubeRefreshToken);

      // ✅ Show success toast
      showToast("YouTube login successful!", "success");

      // ✅ Clean URL by removing query parameters
      window.history.replaceState({}, document.title, "/dashboard");
    }
  }, []);
  // ✅ Extract tokens from URL hash if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const newSpotifyToken = params.get("access_token");
    const newSpotifyRefreshToken = params.get("refresh_token");
    const newYouTubeToken = params.get("youtube_access_token");
    const newYouTubeRefreshToken = params.get("youtube_refresh_token");
    const expiresIn = params.get("expires_in");

    if (newSpotifyToken && newSpotifyRefreshToken && expiresIn) {
      const expirationTime = Date.now() + Number(expiresIn) * 1000;
      setSpotifyToken(newSpotifyToken);
      setSpotifyRefreshToken(newSpotifyRefreshToken);
      setSpotifyExpiration(expirationTime);
      localStorage.setItem("spotify_access_token", newSpotifyToken);
      localStorage.setItem("spotify_refresh_token", newSpotifyRefreshToken);
      localStorage.setItem("spotify_token_expiry", expirationTime.toString());

      // ✅ Show success toast
      showToast("Spotify login successful!", "success");
    }

    if (newYouTubeToken && newYouTubeRefreshToken) {
      setYouTubeToken(newYouTubeToken);
      setYouTubeRefreshToken(newYouTubeRefreshToken);
      localStorage.setItem("youtube_access_token", newYouTubeToken);
      localStorage.setItem("youtube_refresh_token", newYouTubeRefreshToken);
      window.history.replaceState({}, document.title, "/dashboard"); // ✅ Clean the URL
    }
  }, []);

  // ✅ Automatically refresh tokens when needed
  useEffect(() => {
    const interval = setInterval(() => {
      if (spotifyRefreshToken && spotifyExpiration && Date.now() >= spotifyExpiration) {
        refreshSpotifyToken(spotifyRefreshToken).then((newToken) => {
          setSpotifyToken(newToken.access_token);
          const newExpiration = Date.now() + newToken.expires_in * 1000;
          setSpotifyExpiration(newExpiration);
          localStorage.setItem("spotify_access_token", newToken.access_token);
          localStorage.setItem("spotify_token_expiry", newExpiration.toString());
        });
      }

      if (youtubeRefreshToken) {
        refreshYouTubeToken(youtubeRefreshToken).then((newToken) => {
          setYouTubeToken(newToken);
          localStorage.setItem("youtube_access_token", newToken);
        });
      }
    }, 60000); // ✅ Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [spotifyRefreshToken, spotifyExpiration, youtubeRefreshToken]);

  // ✅ Handle login
  const handleLogin = (token: string) => {
    setSpotifyToken(token);
    localStorage.setItem("spotify_access_token", token);
    showToast("Logged in successfully!", "success");
  };

  // ✅ Handle logout
  const handleLogout = () => {
    setSpotifyToken(null);
    setSpotifyRefreshToken(null);
    setSpotifyExpiration(null);
    setYouTubeToken(null);
    setYouTubeRefreshToken(null);
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiry");
    localStorage.removeItem("youtube_access_token");
    localStorage.removeItem("youtube_refresh_token");
    showToast("Logged out successfully!", "info");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Toast />
        <Routes>
          <Route path="/" element={!spotifyToken ? <Home onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={spotifyToken || youtubeToken ? <Dashboard spotifyToken={spotifyToken} youtubeToken={youtubeToken} onLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
