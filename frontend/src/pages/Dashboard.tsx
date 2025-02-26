import React, { useState, useEffect } from "react";
import PlaylistSelector from "../components/PlaylistSelector";
import YouTubePlaylist from "../components/YouTubePlaylist";
import TopNavBar from "../components/TopNavBar";
import { Box } from "@mui/material";
import { fetchPlaylistDetails } from "../api";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardProps {
  spotifyToken: string | null;
  youtubeToken: string | null;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ spotifyToken, youtubeToken, onLogout }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(localStorage.getItem("selectedPlaylistId"));
  const [selectedPlaylistName, setSelectedPlaylistName] = useState<string>(localStorage.getItem("selectedPlaylistName") || "");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    // ✅ Restore the playlist ONLY IF the user is returning from YouTube login
    const storedPlaylistId = localStorage.getItem("selectedPlaylistId");
    const storedPlaylistName = localStorage.getItem("selectedPlaylistName");

    if (storedPlaylistId && storedPlaylistName && youtubeToken) {
      setSelectedPlaylist(storedPlaylistId);
      setSelectedPlaylistName(storedPlaylistName);

      // ✅ Clear storage so new sessions start fresh
      localStorage.removeItem("selectedPlaylistId");
      localStorage.removeItem("selectedPlaylistName");
    }
  }, [youtubeToken]);

  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistDetails(spotifyToken as string, selectedPlaylist).then((playlist) => {
        setSelectedPlaylistName(playlist.name);
      });
    }
  }, [selectedPlaylist, spotifyToken]);

  return (
    <Box>
      <TopNavBar
        onLogout={onLogout}
        onSearchChange={setSearchQuery}
        onGoToPlaylists={() => setSelectedPlaylist(null)} // ✅ Reset selection when clicking "Playlists"
        isLoggedIn={!!spotifyToken}
      />

      <Box sx={{ padding: 3 }}>
        <AnimatePresence mode="wait">
          {!selectedPlaylist ? (
            <motion.div
              key="playlist-selector"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <PlaylistSelector
                token={spotifyToken}
                onSelect={(id, name) => {
                  setSelectedPlaylist(id);
                  setSelectedPlaylistName(name);
                }}
                searchQuery={searchQuery}
              />
            </motion.div>
          ) : (
            <motion.div key="youtube-playlist" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5, ease: "easeOut" }}>
              <YouTubePlaylist youtubeToken={youtubeToken} spotifyToken={spotifyToken} playlistId={selectedPlaylist} playlistName={selectedPlaylistName} searchQuery={searchQuery} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default Dashboard;
