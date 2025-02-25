import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { refreshSpotifyToken, refreshYouTubeToken } from "./api";

const App: React.FC = () => {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [youtubeToken, setYouTubeToken] = useState<string | null>(null);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(null);
  const [youtubeRefreshToken, setYouTubeRefreshToken] = useState<string | null>(null);
  const [spotifyExpiration, setSpotifyExpiration] = useState<number | null>(null);

  useEffect(() => {
    // Load tokens from localStorage on app start
    const storedSpotifyToken = localStorage.getItem("spotify_access_token");
    const storedYouTubeToken = localStorage.getItem("youtube_access_token");
    const storedSpotifyRefresh = localStorage.getItem("spotify_refresh_token");
    const storedYouTubeRefresh = localStorage.getItem("youtube_refresh_token");
    const storedSpotifyExpiration = localStorage.getItem("spotify_token_expiry");

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
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [spotifyRefreshToken, youtubeRefreshToken, spotifyExpiration]);

  const handleLogin = (newSpotifyToken: string, newYouTubeToken: string) => {
    setSpotifyToken(newSpotifyToken);
    setYouTubeToken(newYouTubeToken);
    localStorage.setItem("spotify_access_token", newSpotifyToken);
    localStorage.setItem("youtube_access_token", newYouTubeToken);
  };

  const handleLogout = () => {
    setSpotifyToken(null);
    setYouTubeToken(null);
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("youtube_access_token");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!spotifyToken || !youtubeToken ? <Home onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={spotifyToken && youtubeToken ? <Dashboard spotifyToken={spotifyToken} youtubeToken={youtubeToken} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
