import React, { useEffect, useState } from "react";
import { fetchPlaylistTracks, searchYouTube, createYouTubePlaylist } from "../api";
import { Button, List, ListItem, ListItemText, Typography, CircularProgress } from "@mui/material";

interface YouTubePlaylistProps {
  token: string;
  playlistId: string;
}

const YouTubePlaylist: React.FC<YouTubePlaylistProps> = ({ token, playlistId }) => {
  const [tracks, setTracks] = useState<{ name: string; artist: string; id: string }[]>([]);
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playlistCreated, setPlaylistCreated] = useState<boolean>(false);

  useEffect(() => {
    const getTracksAndSearchYouTube = async () => {
      try {
        const spotifyTracks = await fetchPlaylistTracks(token, playlistId);
        setTracks(spotifyTracks);

        const videoResults = await Promise.all(spotifyTracks.map((track) => searchYouTube(`${track.name} ${track.artist} official music video`)));

        const foundVideoIds = videoResults.map((video) => video?.id?.videoId).filter(Boolean);
        setVideoIds(foundVideoIds);
      } catch (error) {
        console.error("Error fetching tracks or searching YouTube:", error);
      } finally {
        setLoading(false);
      }
    };

    getTracksAndSearchYouTube();
  }, [token, playlistId]);

  const handleCreatePlaylist = async () => {
    if (videoIds.length === 0) return alert("No videos found."); //TODO: Replace with Snackbar

    try {
      await createYouTubePlaylist("My YouTube To Spotify Playlist", videoIds, token);
      setPlaylistCreated(true);
    } catch (error) {
      console.error("Error creating YouTube playlist:", error);
    }
  };

  if (loading) return <CircularProgress />;
  if (playlistCreated) return <Typography variant="h6">YouTube Playlist Created!</Typography>;

  return (
    <div>
      <Typography variant="h5">Tracks from Spotify Playlist</Typography>
      <List>
        {tracks.map((track) => (
          <ListItem key={track.id}>
            <ListItemText primary={`${track.name} - ${track.artist}`} />
          </ListItem>
        ))}
      </List>
      <Button variant="contained" color="primary" onClick={handleCreatePlaylist}>
        Create YouTube Playlist
      </Button>
    </div>
  );
};

export default YouTubePlaylist;
