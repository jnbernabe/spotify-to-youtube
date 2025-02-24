import React, { useState } from "react";
import { createYouTubePlaylist } from "../api";
import { Button, List, ListItem, ListItemText, Typography } from "@mui/material";

const YouTubePlaylist: React.FC<{ token: string }> = ({ token }) => {
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [playlistTitle, setPlaylistTitle] = useState("My YouTube Playlist");

  const addVideo = (id: string) => {
    setVideoIds([...videoIds, id]);
  };

  const handleCreatePlaylist = async () => {
    await createYouTubePlaylist(playlistTitle, videoIds, token);
    alert("YouTube Playlist Created!");
  };

  return (
    <div>
      <Typography variant="h5">Create YouTube Playlist</Typography>
      <List>
        {videoIds.map((id, index) => (
          <ListItem key={index}>
            <ListItemText primary={`Video ID: ${id}`} />
          </ListItem>
        ))}
      </List>
      <Button onClick={handleCreatePlaylist}>Create Playlist</Button>
    </div>
  );
};

export default YouTubePlaylist;
