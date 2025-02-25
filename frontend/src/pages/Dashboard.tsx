import React, { useState } from "react";
import PlaylistSelector from "../components/PlaylistSelector";
import VideoSearch from "../components/VideoSearch";
import YouTubePlaylist from "../components/YoutubePlaylist";
import { Button, Typography } from "@mui/material";

interface DashboardProps {
  token: string;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ token, onLogout }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Button variant="contained" color="secondary" onClick={onLogout} style={{ marginBottom: "20px" }}>
        Logout
      </Button>

      {!selectedPlaylist ? (
        <PlaylistSelector token={token} onSelect={setSelectedPlaylist} />
      ) : (
        <>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Selected Playlist ID: {selectedPlaylist}
          </Typography>
          <VideoSearch onSelect={(videoId) => console.log("Selected video:", videoId)} />
          {selectedPlaylist ? <YouTubePlaylist token={token} playlistId={selectedPlaylist} /> : <PlaylistSelector token={token} onSelect={setSelectedPlaylist} />}
        </>
      )}
    </div>
  );
};

export default Dashboard;
