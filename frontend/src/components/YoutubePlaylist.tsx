import React, { useEffect, useState } from "react";
import { fetchPlaylistTracks, searchYouTube, createYouTubePlaylist, loginWithYouTube } from "../api";
import { Button, Grid, Card, CardMedia, CardContent, Typography, CircularProgress, Checkbox, Box } from "@mui/material";
import { motion } from "framer-motion";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { styled } from "@mui/material/styles";

interface YouTubePlaylistProps {
  youtubeToken: string | null;
  spotifyToken: string;
  playlistId: string;
  playlistName: string;
  searchQuery: string;
}

interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  selected: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  height: "200px",
  background: "#222",
  color: "white",
  "&:hover": {
    transform: "scale(1.03)",
    transition: "transform 0.3s ease",
  },
}));

const YouTubePlaylist: React.FC<YouTubePlaylistProps> = ({ youtubeToken, spotifyToken, playlistId, playlistName, searchQuery }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [playlistCreated, setPlaylistCreated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState<boolean>(false);
  const [youtubePlaylistUrl, setYouTubePlaylistUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // ✅ Restore selected playlist after YouTube login
  useEffect(() => {
    if (!restored && !playlistId) {
      const storedPlaylistId = localStorage.getItem("selectedPlaylistId");
      const storedPlaylistName = localStorage.getItem("selectedPlaylistName");

      if (storedPlaylistId && storedPlaylistName) {
        console.log("✅ Restoring selected playlist after YouTube login.");
        window.history.replaceState({}, document.title, "/dashboard"); // ✅ Clean URL
        setRestored(true);
      }
    }
  }, [playlistId, restored]);

  useEffect(() => {
    const getPlaylistTracks = async () => {
      try {
        const spotifyTracks = await fetchPlaylistTracks(spotifyToken, playlistId);
        const formattedTracks = spotifyTracks.map((track) => ({
          id: track.id,
          name: track.name,
          artist: track.artist,
          album: track.album,
          albumArt: track.albumArt,
          selected: true,
        }));
        setTracks(formattedTracks);
      } catch (error) {
        console.error("🚨 Error fetching Spotify tracks:", error);
        showToast("Failed to load Spotify playlist!", "error");
      }
    };

    getPlaylistTracks();
  }, [spotifyToken, playlistId]);

  // ✅ Refresh UI after YouTube login
  useEffect(() => {
    if (youtubeToken) {
      navigate("/dashboard");
    }
  }, [youtubeToken, navigate]);

  // ✅ Filter tracks based on search query
  const filteredTracks = tracks.filter((track) => track.name.toLowerCase().includes(searchQuery.toLowerCase()) || track.artist.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleTrackToggle = (trackId: string) => {
    setTracks((prevTracks) => prevTracks.map((track) => (track.id === trackId ? { ...track, selected: !track.selected } : track)));
  };

  const handleCreatePlaylist = async () => {
    if (!youtubeToken) {
      alert("You must authorize YouTube first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedTracks = tracks.filter((track) => track.selected);

      if (selectedTracks.length === 0) {
        setError("No tracks selected. Please select at least one track.");
        setLoading(false);
        return;
      }
      //showToast("Searching for YouTube videos...", "info");

      const videoResults = await Promise.all(
        selectedTracks.map(async (track) => {
          const video = await searchYouTube(`${track.name} ${track.artist} official music video`);
          return video?.id?.videoId || null;
        })
      );

      const validVideoIds = videoResults.filter((id): id is string => Boolean(id));

      if (validVideoIds.length === 0) {
        //setError("No YouTube videos found for this playlist.");
        showToast("No YouTube videos found for this playlist.", "error");
        setLoading(false);
        return;
      }

      const playlistUrl = await createYouTubePlaylist(playlistName, validVideoIds, youtubeToken);
      setYouTubePlaylistUrl(playlistUrl);
      setPlaylistCreated(true);
      showToast("YouTube Playlist Created Successfully!", "success");
    } catch (error: any) {
      console.error("🚨 Error creating YouTube playlist:", error);
      setError("Failed to create YouTube playlist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Box sx={{ maxWidth: "900px", margin: "auto", padding: 2 }}>
        <Typography variant="h6" align="center">
          Select Songs from:
        </Typography>
        <Typography variant="h4" align="center" gutterBottom>
          {playlistName}
        </Typography>

        {error && <Typography color="error">{error}</Typography>}
        {loading && <CircularProgress />}
        {playlistCreated && (
          <Typography variant="h6" color="success">
            ✅ YouTube Playlist Created!
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
          {/* <Typography variant="h6">Select Tracks:</Typography> */}
          {!youtubeToken ? (
            <Button variant="contained" color="secondary" onClick={() => loginWithYouTube(playlistId, playlistName)} sx={{ marginBottom: 2 }}>
              Login to YouTube
            </Button>
          ) : (
            <>
              <Button align="center" variant="contained" color="primary" onClick={handleCreatePlaylist} disabled={loading || playlistCreated} sx={{ marginBottom: 2 }}>
                {loading ? "Creating Playlist..." : "Create YouTube Playlist"}
              </Button>
            </>
          )}
          <Button variant="outlined" onClick={() => setTracks(tracks.map((track) => ({ ...track, selected: !track.selected })))}>
            {tracks.every((track) => track.selected) ? "Deselect All" : "Select All"}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {filteredTracks.map((track) => (
            <Grid item xs={12} sm={6} md={4} key={track.id}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                <StyledCard>
                  <Checkbox checked={track.selected} onChange={() => handleTrackToggle(track.id)} icon={<CheckBoxOutlineBlankIcon />} checkedIcon={<CheckBoxIcon />} />
                  <CardMedia component="img" image={track.albumArt} alt={track.name} sx={{ width: 60, height: 60, marginRight: 2, borderRadius: 1 }} />
                  <CardContent sx={{ padding: 1 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {track.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {track.artist} • {track.album}
                    </Typography>
                  </CardContent>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        {/* ✅ Button to View YouTube Playlist */}
        {playlistCreated && youtubePlaylistUrl && (
          <Box sx={{ textAlign: "center", marginTop: 3 }}>
            <Button variant="contained" color="primary" href={youtubePlaylistUrl} target="_blank">
              View Your YouTube Playlist
            </Button>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default YouTubePlaylist;
