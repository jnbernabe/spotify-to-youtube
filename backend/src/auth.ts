import express from "express";
import axios from "axios";
import querystring from "querystring";
import dotenv from "dotenv";
import logger from "./winston";
require("dotenv").config();

const router = express.Router();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = process.env.PROD ? `${process.env.PROD_BACK_END}/auth/spotify/callback` : `${process.env.LOCAL_BACK_END}/auth/spotify/callback`;
const FRONTEND_URI = process.env.PROD ? `${process.env.PROD_FRONT_END}/` : `${process.env.LOCAL_FRONT_END}`;

logger.info(`REDIRECT_URI: ${REDIRECT_URI}`);
logger.info(`FRONTEND_URI: ${FRONTEND_URI}`);

const generateRandomString = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((x) => chars[x % chars.length])
    .join("");
};

router.get("/login", (req, res) => {
  const scope = "user-read-private user-read-email playlist-read-private user-library-read";
  const state = generateRandomString(16);
  logger.info("Logging in with Spotify");
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
    logger.warn("Missing authorization code");
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
    logger.info("User Logged In with Spotify");
    res.redirect(`${FRONTEND_URI}/#access_token=${access_token}&refresh_token=${refresh_token}&expires_in=${expires_in}`);
  } catch (error) {
    logger.error("Error fetching Spotify token");
    res.redirect(`${FRONTEND_URI}/?error=token_fetch_failed`);
  }
});

const refreshToken: express.RequestHandler = async (req, res): Promise<any> => {
  const refresh_token = req.query.refresh_token as string;
  if (!refresh_token) {
    logger.warn("Missing refresh token");
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
    logger.info("Spotify Token Refreshed");
    res.json({ access_token, expires_in });
  } catch (error) {
    logger.error("Error refreshing token");
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

router.get("/refresh_token", refreshToken);

const spotifyPlaylists: express.RequestHandler = async (req, res): Promise<any> => {
  const accessToken = req.headers.authorization; // Get token from request headers

  if (!accessToken) {
    logger.error("No access token provided");
    return res.status(401).json({ error: "No access token provided" });
  }

  try {
    // Fetch user's playlists
    logger.info("Fetching Playlists from Spotify API");
    const response = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `${accessToken}` },
    });
    logger.info("Playlists Fetched");
    res.json(response.data); // Send playlists data to frontend
  } catch (error) {
    logger.error("Error fetching playlists");
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

router.get("/playlists", spotifyPlaylists);

const playlistTracks: express.RequestHandler = async (req, res): Promise<any> => {
  const { playlistId } = req.params;
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    logger.error("No access token provided");
    return res.status(401).json({ error: "No access token provided" });
  }
  if (!playlistId) {
    logger.error("Playlist ID is required");
    return res.status(400).json({ error: "Playlist ID is required" });
  }

  try {
    logger.info("Fetching Playlist Tracks from Spotify API");
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `${accessToken}` },
    });

    const tracks = response.data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      artist: item.track.artists.map((artist: any) => artist.name).join(", "),
      album: item.track.album.name,
      albumArt: item.track.album.images.length > 0 ? item.track.album.images[0].url : "",
    }));

    logger.info("Playlist Tracks Fetched");
    res.json(tracks);
  } catch (error) {
    logger.error("Error fetching playlist tracks");
    res.status(500).json({ error: "Failed to fetch playlist tracks" });
  }
};

router.get("/playlists/:playlistId/tracks", playlistTracks);

export default router;
