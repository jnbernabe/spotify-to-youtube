import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
require("dotenv").config();

const router = express.Router();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.PROD ? "https://spottotube.onrender.com/auth/spotify/callback" : "http://localhost:5000/auth/spotify/callback";
const FRONTEND_URI = process.env.PROD ? "https://spottotube.netlify.app" : "http://localhost:5173"; // Redirect here after login

console.log("REDIRECT_URI", REDIRECT_URI);
console.log("FRONTEND_URI", FRONTEND_URI);

const generateRandomString = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private user-library-read";
  const state = generateRandomString(16);
  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    state,
  })}`;

  res.redirect(authUrl);
});

router.get("/spotify/callback", async (req, res) => {
  const code = req.query.code as string;
  const tokenUrl = "https://accounts.spotify.com/api/token";

  if (!code) {
    return res.redirect(`${FRONTEND_URI}/?error=authorization_failed`);
  }

  try {
    const response = await axios.post(
      tokenUrl,
      querystring.stringify({
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
      }
    );
    const { access_token, refresh_token, expires_in } = response.data;
    //console.log("Spotify tokens:", access_token, refresh_token, expires_in);
    res.redirect(`${FRONTEND_URI}/#access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (error) {
    console.error("Error fetching token:", error);
    res.redirect(`${FRONTEND_URI}/?error=token_fetch_failed`);
  }
});

const refreshToken: express.RequestHandler = async (req, res): Promise<any> => {
  const refresh_token = req.query.refresh_token as string;
  if (!refresh_token) {
    return res.status(400).json({ error: "Missing refresh token" });
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
        },
      }
    );

    const { access_token, expires_in } = response.data;
    res.json({ access_token, expires_in });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

router.get("/refresh_token", refreshToken);

const spotifyPlaylists: express.RequestHandler = async (req, res): Promise<any> => {
  const accessToken = req.headers.authorization; // Get token from request headers

  if (!accessToken) {
    return res.status(401).json({ error: "No access token provided" });
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    res.json(response.data); // Send playlists data to frontend
  } catch (error) {
    console.error("Error fetching playlists:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

router.get("/playlists", spotifyPlaylists);

const playlistTracks: express.RequestHandler = async (req, res): Promise<any> => {
  const { playlistId } = req.params;
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return res.status(401).json({ error: "No access token provided" });
  }
  if (!playlistId) {
    console.error("Error: Playlist ID is undefined in backend request");
    return res.status(400).json({ error: "Playlist ID is required" });
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `${accessToken}` },
    });

    const tracks = response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(", "),
    }));
    res.json(tracks);
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    res.status(500).json({ error: "Failed to fetch playlist tracks" });
  }
};

router.get("/playlist/:playlistId/tracks", playlistTracks);

export default router;
