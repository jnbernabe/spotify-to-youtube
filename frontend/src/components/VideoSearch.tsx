import React, { useState } from "react";
import { searchYouTube } from "../api";
import { Button, TextField, Typography, List, ListItem, ListItemText } from "@mui/material";

const VideoSearch: React.FC<{ onSelect: (videoId: string) => void }> = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [video, setVideo] = useState<{ id: string; title: string } | null>(null);

  const handleSearch = async () => {
    const result = await searchYouTube(query);
    if (result) {
      setVideo({ id: result.id.videoId, title: result.snippet.title });
    }
  };

  return (
    <div>
      <Typography variant="h5">Search for a Song:</Typography>
      <TextField value={query} onChange={(e) => setQuery(e.target.value)} label="Song Name" />
      <Button onClick={handleSearch}>Search</Button>
      {video && (
        <List>
          <ListItem component="button" onClick={() => onSelect(video.id)}>
            <ListItemText primary={video.title} />
          </ListItem>
        </List>
      )}
    </div>
  );
};

export default VideoSearch;
