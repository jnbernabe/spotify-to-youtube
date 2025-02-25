import axios from "axios";

const API_URL = "http://localhost:5000";

export const loginWithSpotify = () => {
  window.location.href = `${API_URL}/auth/login`;
};

export const fetchPlaylists = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/playlists`, {
      headers: { Authorization: `${token}` },
    });

    return response.data; // Return playlists data
  } catch (error) {
    console.error("Error fetching playlists:", error);
    throw error;
  }
};

// Fetch tracks from a specific Spotify playlist
export const fetchPlaylistTracks = async (token: string, playlistId: string) => {
  if (!playlistId) {
    console.error("fetchPlaylistTracks error: playlistId is undefined");
    return;
  }
  try {
    //console.log(`Fetching tracks for playlist: ${playlistId}`);
    const response = await axios.get(`${API_URL}/auth/playlist/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data; // List of tracks
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    throw error;
  }
};

// Search for YouTube video by song name + artist
export const searchYouTube = async (query: string) => {
  try {
    const response = await axios.get(`${API_URL}/youtube/search`, {
      params: { query },
    });

    return response.data; // Returns YouTube video details
  } catch (error) {
    console.error("Error searching YouTube:", error);
    throw error;
  }
};

// Create a YouTube playlist and add videos
export const createYouTubePlaylist = async (title: string, videoIds: string[], token: string) => {
  try {
    const response = await axios.post(`${API_URL}/youtube/create-playlist`, { title, videoIds, accessToken: token });

    return response.data; // Returns YouTube playlist ID
  } catch (error) {
    console.error("Error creating YouTube playlist:", error);
    throw error;
  }
};

export const refreshSpotifyToken = async (refreshToken: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/refresh_token`, {
      params: { refresh_token: refreshToken },
    });

    return response.data; // { access_token: string, expires_in: number }
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};
