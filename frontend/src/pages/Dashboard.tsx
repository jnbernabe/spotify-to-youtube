import React, { useState, useEffect } from "react";
import PlaylistSelector from "../components/PlaylistSelector";
import YouTubePlaylist from "../components/YoutubePlaylist";
import { Button, Typography } from "@mui/material";

interface DashboardProps {
  spotifyToken: string;
  youtubeToken: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ spotifyToken, youtubeToken, onLogout }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  useEffect(() => {
    console.log("Spotify Token:", spotifyToken);
    console.log("YouTube Token:", youtubeToken);
    console.log("Selected Playlist ID:", selectedPlaylist);
  }, [spotifyToken, youtubeToken, selectedPlaylist]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Button variant="contained" color="secondary" onClick={onLogout} style={{ marginBottom: "20px" }}>
        Logout
      </Button>

      {!selectedPlaylist ? (
        <PlaylistSelector
          token={spotifyToken}
          onSelect={(id) => {
            console.log("Playlist selected:", id);
            setSelectedPlaylist(id);
          }}
        />
      ) : (
        <>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Selected Playlist ID: {selectedPlaylist}
          </Typography>
          <YouTubePlaylist token={youtubeToken} playlistId={selectedPlaylist} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
