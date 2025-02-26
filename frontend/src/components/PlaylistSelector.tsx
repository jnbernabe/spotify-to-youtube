import React, { useEffect, useState } from "react";
import { fetchPlaylists } from "../api";
import { Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Box } from "@mui/material";
import { motion } from "framer-motion";

interface Playlist {
  id: string;
  name: string;
  image: string;
  totalTracks: number;
}

interface PlaylistSelectorProps {
  token: string | null;
  onSelect: (playlistId: string, playlistName: string) => void;
  searchQuery: string;
}

const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({ token, onSelect, searchQuery }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const userPlaylists = await fetchPlaylists(token as string);
        setPlaylists(userPlaylists);
      } catch (error) {
        console.error("🚨 Error fetching playlists:", error);
      } finally {
        setLoading(false);
      }
    };

    getPlaylists();
  }, [token]);

  const filteredPlaylists = playlists.filter((playlist) => playlist.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <CircularProgress sx={{ display: "block", margin: "auto", marginTop: 3 }} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Box sx={{ maxWidth: "900px", margin: "auto", padding: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Select a Playlist
        </Typography>

        <Grid container spacing={3}>
          {filteredPlaylists.map((playlist) => (
            <Grid item xs={12} sm={6} md={4} key={playlist.id}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                <Card onClick={() => onSelect(playlist.id, playlist.name)} sx={{ cursor: "pointer", backgroundColor: "#1a1a1a" }}>
                  <CardMedia component="img" image={playlist.image || "/default_playlist.png"} alt={playlist.name} sx={{ height: 160 }} />
                  <CardContent>
                    <Typography variant="body1" fontWeight="bold" color="white">
                      {playlist.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {playlist.totalTracks} Tracks
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default PlaylistSelector;
