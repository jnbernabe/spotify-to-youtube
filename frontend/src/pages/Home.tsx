import React, { useEffect } from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { loginWithSpotify } from "../api";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";

interface HomeProps {
  onLogin: (spotifyToken: string) => void;
}
const HeroContainer = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  textAlign: "center",
  background: `linear-gradient(135deg, rgba(30,30,30,0.9), rgba(15,15,15,0.95)))`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "white",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: "12px 24px",
  fontSize: "1.2rem",
  background: "linear-gradient(90deg, #1DB954, #1ED760)",
  "&:hover": {
    background: "linear-gradient(90deg, #1ED760, #1DB954)",
  },
}));

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
    <HeroContainer maxWidth="md">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Typography variant="h2" fontWeight="bold">
          Convert Your Spotify Playlist to YouTube
        </Typography>
        <Typography variant="h5" sx={{ mt: 2, maxWidth: "600px", mx: "auto" }}>
          Easily transfer your favorite songs from Spotify to a YouTube playlist with just a few clicks.
        </Typography>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.3 }}>
        <StyledButton variant="contained" onClick={loginWithSpotify}>
          Login with Spotify
        </StyledButton>
      </motion.div>
    </HeroContainer>
  );
};

export default Home;
