import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
require("dotenv").config();

const router = express.Router();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5000/auth/spotify/callback";

const generateRandomString = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

router.get("/test", (req, res) => {
  res.json({ SPOTIFY_CLIENT_ID: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET: SPOTIFY_CLIENT_SECRET, REDIRECT_URI: REDIRECT_URI });
});

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
    const { access_token, refresh_token } = response.data;
    res.json({ access_token, refresh_token });
  } catch (error) {
    console.error("Error fetching token", error);
    res.status(500).json({ error: "Error fetching token" });
  }
});

const spotifyPlaylists: express.RequestHandler = async (req, res): Promise<void> => {
  const accessToken = req.headers.authorization;

  if (!accessToken) {
    res.status(401).json({ error: "No access token" }); //TODO
    return;
  }

  try {
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

router.get("/playlists", spotifyPlaylists);

export default router;
