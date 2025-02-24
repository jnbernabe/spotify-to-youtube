import axios from "axios";

const API_URL = "http://localhost:5000";

export const loginWithSpotify = () => {
  window.location.href = `${API_URL}/auth/login`;
};

export const fetchPlaylists = async (token: string) => {
  const response = await axios.get(`${API_URL}/auth/playlists`, {
    headers: {
      Authorization: token,
    },
  });
  return response.data;
};

export const searchYouTube = async (query: string) => {
  const response = await axios.get(`${API_URL}/youtube/search`, {
    params: {
      query,
    },
  });
  return response.data;
};

export const createYouTubePlaylist = async (title: string, videoIds: string[], token: string) => {
  const response = await axios.post(`${API_URL}/youtube/create-playlist`, {
    title,
    videoIds,
    accessToken: token,
  });
  return response.data;
};
