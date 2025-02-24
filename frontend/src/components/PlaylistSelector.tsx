import React, { useEffect, useState } from "react";
import { fetchPlaylists } from "../api";
import { Button, List, ListItem, ListItemText, Typography } from "@mui/material";

interface Playlist {
  id: string;
  name: string;
}

const PlaylistSelector: React.FC<{ token: string; onSelect: (id: string) => void }> = ({ token, onSelect }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    const getPlaylist = async () => {
      const data = await fetchPlaylists(token);
      setPlaylists(data.items);
    };
    getPlaylist();
  }, [token]);

  return (
    <div>
      <Typography variant="h5">Select a Playlist:</Typography>
      <List>
        {playlists.map((playlist) => (
          <ListItem key={playlist.id} button onClick={() => onSelect(playlist.id)}>
            <ListItemText primary={playlist.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default PlaylistSelector;
