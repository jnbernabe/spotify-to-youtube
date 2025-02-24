import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem("spotify_access_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={token ? <Dashboard token={token} /> : <Home />} />
      </Routes>
    </Router>
  );
};

export default App;
