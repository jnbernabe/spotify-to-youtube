import React, { useEffect, useState } from "react";
import { fetchPlaylistTracks, searchYouTube, createYouTubePlaylist, loginWithYouTube } from "../api";
import { Button, Grid, Card, CardMedia, CardContent, Typography, Box, ButtonGroup } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast";
import { styled } from "@mui/material/styles";

interface YouTubePlaylistProps {
  youtubeToken: string | null;
  spotifyToken: string | null;
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

const StyledCard = styled(Card)<{ selected: boolean }>(({ theme, selected }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2),
  height: "15rem",
  background: "#222",
  color: "white",
  cursor: "pointer",
  border: selected ? "3px solid #1DB954" : "1px solid #333",
  boxShadow: selected ? "0px 0px 15px #1DB954" : "none",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.03)",
    transition: "transform 0.3s ease",
  },
}));

const YouTubePlaylist: React.FC<YouTubePlaylistProps> = ({ youtubeToken, spotifyToken, playlistId, playlistName, searchQuery }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [playlistCreated, setPlaylistCreated] = useState<boolean>(false);
  //const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState<boolean>(false);
  const [youtubePlaylistUrl, setYouTubePlaylistUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  // ✅ Filter tracks based on search query
  const filteredTracks = tracks.filter((track) => track.name.toLowerCase().includes(searchQuery.toLowerCase()) || track.artist.toLowerCase().includes(searchQuery.toLowerCase()));

  const selectedTracks = tracks.filter((track) => track.selected);

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
        const spotifyTracks = await fetchPlaylistTracks(spotifyToken as string, playlistId);
        const formattedTracks = spotifyTracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artist,
          album: track.album,
          albumArt: track.albumArt,
          selected: false,
        }));
        setTracks(formattedTracks);
      } catch (error) {
        console.error("Error fetching Spotify tracks:", error);
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

  const handleTrackToggle = (trackId: string) => {
    setTracks((prevTracks) => prevTracks.map((track) => (track.id === trackId ? { ...track, selected: !track.selected } : track)));
  };

  const handleSelectAll = () => {
    setTracks((prevTracks) => {
      const allSelected = prevTracks.every((track) => track.selected);
      return prevTracks.map((track) => ({ ...track, selected: !allSelected }));
    });
  };

  const handleCreatePlaylist = async () => {
    if (!youtubeToken) {
      showToast("You must authorize YouTube first.", "info");
      return;
    }

    setLoading(true);
    //setError(null);

    try {
      const selectedTracks = tracks.filter((track) => track.selected);

      if (selectedTracks.length === 0) {
        showToast("Please select at least one track.", "error");
        //setError("No tracks selected. Please select at least one track.");
        setLoading(false);
        return;
      }

      if (selectedTracks.length > 10) {
        //setError("Please Select less than 10 tracks.");
        showToast("Please select less than 10 tracks.", "error");
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
        showToast("No YouTube music videos found for this playlist.", "error");
        setLoading(false);
        return;
      }

      const playlistId = await createYouTubePlaylist(playlistName, validVideoIds, youtubeToken);
      setYouTubePlaylistUrl(`https://www.youtube.com/playlist?list=${playlistId}`);
      setPlaylistCreated(true);
      showToast("YouTube Playlist Created Successfully!", "success");
    } catch (error: any) {
      console.error("🚨 Error creating YouTube playlist:", error);
      showToast("Failed to create YouTube playlist.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }}>
      <Box sx={{ maxWidth: "900px", margin: "auto", padding: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          {playlistName}
        </Typography>
        {selectedTracks.length < 10 ? (
          <Typography variant="h5" align="center" gutterBottom>
            {`Selected Songs: ${selectedTracks.length}/10`}
          </Typography>
        ) : (
          <Typography variant="h5" align="center" gutterBottom color="red">
            {`Selected Songs: ${selectedTracks.length}/10`}
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
              <ButtonGroup>
                <Button variant="contained" color="primary" onClick={handleCreatePlaylist} disabled={loading || playlistCreated} sx={{ marginBottom: 2 }}>
                  {loading ? "Creating Playlist..." : "Create YouTube Playlist"}
                </Button>
                {/* ✅ Button to View YouTube Playlist */}
                {playlistCreated && youtubePlaylistUrl && (
                  <Button variant="contained" color="primary" href={youtubePlaylistUrl} target="_blank" sx={{ marginBottom: 2 }}>
                    View Your YouTube Playlist
                  </Button>
                )}
              </ButtonGroup>
            </>
          )}

          <Button variant="outlined" sx={{ marginBottom: 2 }} onClick={handleSelectAll}>
            {tracks.every((track) => track.selected) ? "Deselect All" : "Select All"}
          </Button>
        </Box>

        <Grid container spacing={2}>
          {filteredTracks.map((track) => (
            <Grid item xs={12} sm={6} md={4} key={track.id}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                <StyledCard selected={track.selected} onClick={() => handleTrackToggle(track.id)}>
                  {/* <Checkbox checked={track.selected} onChange={() => handleTrackToggle(track.id)} icon={<CheckBoxOutlineBlankIcon />} checkedIcon={<CheckBoxIcon />} /> */}
                  <CardMedia component="img" image={track.albumArt} alt={track.name} sx={{ width: 100, height: 100, marginRight: 2, borderRadius: 1 }} />
                  <CardContent sx={{ textAlign: "center" }}>
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
      </Box>
    </motion.div>
  );
};

export default YouTubePlaylist;
