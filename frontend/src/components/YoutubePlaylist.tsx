import React, { useEffect, useState } from "react";
import { fetchPlaylistTracks, searchYouTube, createYouTubePlaylist } from "../api";
import { Button, List, ListItem, ListItemText, Typography, CircularProgress } from "@mui/material";

interface YouTubePlaylistProps {
  youtubeToken: string | null;
  spotifyToken: string | null;
  playlistId: string;
}

const YouTubePlaylist: React.FC<YouTubePlaylistProps> = ({ youtubeToken, spotifyToken, playlistId }) => {
  const [tracks, setTracks] = useState<{ id: string; name: string; artist: string }[]>([]);
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [playlistCreated, setPlaylistCreated] = useState<boolean>(false);

  useEffect(() => {
    const getTracksAndSearchYouTube = async () => {
      if (!youtubeToken || !spotifyToken) return;

      try {
        const spotifyTracks = await fetchPlaylistTracks(spotifyToken as string, playlistId);
        setTracks(spotifyTracks);

        const videoResults = await Promise.all(spotifyTracks.map((track: { id: string; name: string; artist: string }) => searchYouTube(`${track.name} ${track.artist} official music video`)));

        const foundVideoIds = videoResults.map((video) => video?.id?.videoId).filter((id): id is string => Boolean(id));

        setVideoIds(foundVideoIds);
      } catch (error) {
        console.error("Error fetching tracks or searching YouTube:", error);
      } finally {
        setLoading(false);
      }
    };

    getTracksAndSearchYouTube();
  }, [spotifyToken, playlistId]);

  const handleCreatePlaylist = async () => {
    if (!youtubeToken) {
      alert("You must authorize YouTube first.");
      return;
    }

    if (videoIds.length === 0) {
      alert("No videos found.");
      return;
    }

    try {
      await createYouTubePlaylist("My YouTube Playlist", videoIds, youtubeToken);
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
        {youtubeToken ? "Create YouTube Playlist" : "Authorize YouTube First"}
      </Button>
    </div>
  );
};

export default YouTubePlaylist;
