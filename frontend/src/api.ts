import axios from "axios";
import { AxiosError } from "axios";

const API_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : "http://localhost:5000";

export const loginWithSpotify = () => {
  window.location.href = `${API_URL}/auth/login`;
};

export const fetchPlaylists = async (token: string) => {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.items.map((playlist: any) => ({
      id: playlist.id,
      name: playlist.name,
      image: playlist.images.length > 0 ? playlist.images[0].url : "",
      totalTracks: playlist.tracks.total,
    }));
  } catch (error: any) {
    console.error("🚨 Error fetching playlists:", error.response?.data || error.message);
    throw error;
  }
};

export const fetchPlaylistTracks = async (token: string, playlistId: string) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(", "),
      album: item.track.album.name,
      albumArt: item.track.album.images.length > 0 ? item.track.album.images[0].url : "",
    }));
  } catch (error: any) {
    console.error("🚨 Error fetching Spotify playlist tracks:", error.response?.data || error.message);
    throw error;
  }
};
// Refresh Spotify access token
export const refreshSpotifyToken = async (refreshToken: string) => {
  try {
    const response = await axios.get(`${API_URL}/auth/refresh_token`, {
      params: { refresh_token: refreshToken },
    });

    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
};

//YOUTUBE

// Redirect user to YouTube login
export const loginWithYouTube = (playlistId: string, playlistName: string) => {
  localStorage.setItem("selectedPlaylistId", playlistId);
  localStorage.setItem("selectedPlaylistName", playlistName);

  window.location.href = `${API_URL}/youtube/auth`;
};

// Refresh YouTube access token
export const refreshYouTubeToken = async (refreshToken: string) => {
  try {
    const response = await axios.get(`${API_URL}/youtube/refresh_token`, {
      params: { refresh_token: refreshToken },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error refreshing YouTube token:", error);
    throw error;
  }
};

export const searchYouTube = async (query: string) => {
  try {
    if (!query) throw new Error("Missing search query for YouTube API");

    const response = await axios.get(`${API_URL}/youtube/search`, {
      params: { query },
    });

    if (!response.data || !response.data.id || !response.data.id.videoId) {
      console.warn("No valid YouTube video found for query:", query);
      return null;
    }

    return response.data;
  } catch (error: AxiosError | any) {
    console.error("Error searching YouTube:", error.response?.data || error.message);
    return null;
  }
};

// Create a YouTube playlist with the selected videos
export const createYouTubePlaylist = async (title: string, videoIds: string[], accessToken: string) => {
  try {
    if (!title || !videoIds.length || !accessToken) {
      throw new Error("Missing required fields for YouTube playlist creation");
    }

    const response = await axios.post(`${API_URL}/youtube/create-playlist`, {
      title,
      videoIds,
      accessToken,
    });
    const playlistID = response.data.playlistId;

    return playlistID;
  } catch (error: any) {
    if (error.response?.status === 403) {
      return { error: "YouTube API limit exceeded" };
    }
    console.error("Error searching YouTube:", error.response?.data || error.message);
    return null;
  }
};

// ✅ Fetch Spotify playlist details (name, description, etc.)
export const fetchPlaylistDetails = async (token: string, playlistId: string) => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      id: response.data.id,
      name: response.data.name,
      description: response.data.description || "",
      owner: response.data.owner.display_name,
    };
  } catch (error: any) {
    console.error("🚨 Error fetching Spotify playlist details:", error.response?.data || error.message);
    throw error;
  }
};
