import React, { useEffect, useState } from "react";
import { fetchPlaylists } from "../api";
import { Button, List, ListItem, ListItemText, Typography, CircularProgress } from "@mui/material";

interface Playlist {
  id: string;
  name: string;
  images: { url: string }[];
}

const PlaylistSelector: React.FC<{ token: string; onSelect: (id: string) => void }> = ({ token, onSelect }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPlaylists = async () => {
      try {
        const data = await fetchPlaylists(token);
        setPlaylists(data.items);
      } catch (err) {
        setError("Failed to load playlists.");
      } finally {
        setLoading(false);
      }
    };
    getPlaylists();
  }, [token]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div>
      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Select a Playlist:
      </Typography>
      <List>
        {playlists.map((playlist) => (
          <ListItem key={playlist.id} button onClick={() => onSelect(playlist.id)}>
            {playlist.images.length > 0 && <img src={playlist.images[0].url} alt={playlist.name} width={50} height={50} style={{ marginRight: 10 }} />}
            <ListItemText primary={playlist.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default PlaylistSelector;
