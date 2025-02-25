import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import { refreshSpotifyToken } from "./api";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expirationTime, setExpirationTime] = useState<number | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token");
    const storedRefreshToken = localStorage.getItem("spotify_refresh_token");
    const storedExpiration = localStorage.getItem("spotify_token_expiry");

    if (storedToken && storedRefreshToken && storedExpiration) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setExpirationTime(Number(storedExpiration));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (refreshToken && expirationTime && Date.now() >= expirationTime) {
        refreshSpotifyToken(refreshToken).then(({ access_token, expires_in }: { access_token: string; expires_in: number }) => {
          setToken(access_token);
          const newExpirationTime = Date.now() + expires_in * 1000;
          setExpirationTime(newExpirationTime);

          localStorage.setItem("spotify_access_token", access_token);
          localStorage.setItem("spotify_token_expiry", newExpirationTime.toString());
        });
      }
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, [refreshToken, expirationTime]);

  const handleLogin = (accessToken: string, refreshToken: string, expiresIn: number) => {
    setToken(accessToken);
    setRefreshToken(refreshToken);
    const expirationTime = Date.now() + expiresIn * 1000;
    setExpirationTime(expirationTime);

    localStorage.setItem("spotify_access_token", accessToken);
    localStorage.setItem("spotify_refresh_token", refreshToken);
    localStorage.setItem("spotify_token_expiry", expirationTime.toString());
  };

  const handleLogout = () => {
    setToken(null);
    setRefreshToken(null);
    setExpirationTime(null);
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expiry");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!token ? <Home onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
