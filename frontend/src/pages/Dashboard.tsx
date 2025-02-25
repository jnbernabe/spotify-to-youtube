import React, { useState, useEffect } from "react";
import PlaylistSelector from "../components/PlaylistSelector";
import YouTubePlaylist from "../components/YoutubePlaylist";
import { Button, Typography } from "@mui/material";
import { loginWithYouTube } from "../api";

interface DashboardProps {
  spotifyToken: string | null;
  youtubeToken: string | null;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ spotifyToken, youtubeToken, onLogout }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isYouTubeLoggedIn, setIsYouTubeLoggedIn] = useState<boolean>(!!youtubeToken);

  useEffect(() => {
    // console.log("Spotify Token:", spotifyToken);
    // console.log("YouTube Token:", youtubeToken);
    // console.log("Selected Playlist ID:", selectedPlaylist);

    if (youtubeToken) {
      setIsYouTubeLoggedIn(true);
    }
  }, [spotifyToken, youtubeToken, selectedPlaylist]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Button variant="contained" color="secondary" onClick={onLogout} style={{ marginBottom: "20px" }}>
        Logout
      </Button>

      <div>
        <Typography variant="h6">{isYouTubeLoggedIn ? "✅ YouTube Connected" : "❌ YouTube Not Connected"}</Typography>
        {!isYouTubeLoggedIn && (
          <Button variant="contained" color="primary" onClick={loginWithYouTube} style={{ marginTop: "10px" }}>
            Login to YouTube
          </Button>
        )}
      </div>

      {!selectedPlaylist ? (
        <PlaylistSelector token={spotifyToken} onSelect={(id) => setSelectedPlaylist(id)} />
      ) : (
        <>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Selected Playlist ID: {selectedPlaylist}
          </Typography>
          <YouTubePlaylist youtubeToken={youtubeToken} spotifyToken={spotifyToken} playlistId={selectedPlaylist} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
