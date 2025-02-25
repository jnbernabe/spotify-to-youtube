import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { refreshSpotifyToken, refreshYouTubeToken } from "./api";

const App: React.FC = () => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(null);
  const [spotifyExpiration, setSpotifyExpiration] = useState<number | null>(null);
  const [youtubeToken, setYouTubeToken] = useState<string | null>(null);
  const [youtubeRefreshToken, setYouTubeRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract Spotify & YouTube tokens separately
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
    }

    if (newYouTubeToken && newYouTubeRefreshToken) {
      setYouTubeToken(newYouTubeToken);
      setYouTubeRefreshToken(newYouTubeRefreshToken);
      localStorage.setItem("youtube_access_token", newYouTubeToken);
      localStorage.setItem("youtube_refresh_token", newYouTubeRefreshToken);
      window.history.replaceState({}, document.title, "/dashboard"); // Clean the URL
    }
  }, []);

  useEffect(() => {
    // Load tokens from localStorage on app start
    const storedSpotifyToken = localStorage.getItem("spotify_access_token");
    const storedSpotifyRefresh = localStorage.getItem("spotify_refresh_token");
    const storedSpotifyExpiration = localStorage.getItem("spotify_token_expiry");
    const storedYouTubeToken = localStorage.getItem("youtube_access_token");
    const storedYouTubeRefresh = localStorage.getItem("youtube_refresh_token");

    if (storedSpotifyToken && storedSpotifyRefresh && storedSpotifyExpiration) {
      setSpotifyToken(storedSpotifyToken);
      setSpotifyRefreshToken(storedSpotifyRefresh);
      setSpotifyExpiration(Number(storedSpotifyExpiration));
    }

    if (storedYouTubeToken && storedYouTubeRefresh) {
      setYouTubeToken(storedYouTubeToken);
      setYouTubeRefreshToken(storedYouTubeRefresh);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh Spotify token if expired
      if (spotifyRefreshToken && spotifyExpiration && Date.now() >= spotifyExpiration) {
        refreshSpotifyToken(spotifyRefreshToken).then((newToken) => {
          setSpotifyToken(newToken.access_token);
          const newExpiration = Date.now() + newToken.expires_in * 1000;
          setSpotifyExpiration(newExpiration);
          localStorage.setItem("spotify_access_token", newToken.access_token);
          localStorage.setItem("spotify_token_expiry", newExpiration.toString());
        });
      }

      // Refresh YouTube token only if YouTube is authenticated
      if (youtubeRefreshToken) {
        refreshYouTubeToken(youtubeRefreshToken).then((newToken) => {
          setYouTubeToken(newToken);
          localStorage.setItem("youtube_access_token", newToken);
        });
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [spotifyRefreshToken, spotifyExpiration, youtubeRefreshToken]);

  const handleLogin = (token: string) => {
    setSpotifyToken(token);
    localStorage.setItem("spotify_access_token", token);
  };

  const handleLogout = () => {
    setSpotifyToken(null);
    setSpotifyRefreshToken(null);
    setYouTubeToken(null);
    setYouTubeRefreshToken(null);
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiry");
    localStorage.removeItem("youtube_access_token");
    localStorage.removeItem("youtube_refresh_token");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!spotifyToken ? <Home onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={spotifyToken || youtubeToken ? <Dashboard spotifyToken={spotifyToken} youtubeToken={youtubeToken} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
