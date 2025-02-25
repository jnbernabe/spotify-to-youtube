import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import querystring from "querystring";

dotenv.config();

const router = express.Router();

const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_REDIRECT_URI = process.env.YOUTUBE_REDIRECT_URI!;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const FRONTEND_URI = "http://localhost:5173"; // Your frontend URL

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

router.get("/auth", (req, res) => {
  const scope = "https://www.googleapis.com/auth/youtube.force-ssl";
  const authUrl = `https://accounts.google.com/o/oauth2/auth?${querystring.stringify({
    client_id: YOUTUBE_CLIENT_ID,
    redirect_uri: YOUTUBE_REDIRECT_URI,
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  })}`;

  res.redirect(authUrl);
});

router.get("/auth/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.redirect(`${FRONTEND_URI}/?error=authorization_failed`);
  }

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      querystring.stringify({
        code,
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        redirect_uri: YOUTUBE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token } = response.data;

    // Redirect user to frontend with tokens
    res.redirect(`${FRONTEND_URI}/#youtube_access_token=${access_token}&youtube_refresh_token=${refresh_token}`);
  } catch (error) {
    console.error("Error fetching YouTube token:", error);
    res.redirect(`${FRONTEND_URI}/?error=token_fetch_failed`);
  }
});

const refreshTokens: express.RequestHandler = async (req, res): Promise<any> => {
  const refreshToken = req.query.refresh_token as string;
  if (!refreshToken) return res.status(400).json({ error: "Missing refresh token" });

  try {
    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      querystring.stringify({
        client_id: YOUTUBE_CLIENT_ID,
        client_secret: YOUTUBE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = response.data;
    res.json({ access_token });
  } catch (error) {
    console.error("Error refreshing YouTube token:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

router.get("/refresh_token", refreshTokens);

const youtubeSearch: express.RequestHandler = async (req, res): Promise<any> => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: "Query is required" }); //TODO
  }
  try {
    const response = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        q: query,
        key: YOUTUBE_API_KEY,
        part: "snippet",
        type: "video",
        maxResults: 1,
      },
    });
    res.json(response.data.items[0]);
  } catch (error) {
    console.error("Error searching YouTube:", error);
    res.status(500).json({ error: "Failed to fetch video" });
    return;
  }
};
router.get("/search", youtubeSearch);

// Create a YouTube Playlist and Add Videos
router.post("/create-playlist", async (req, res) => {
  const { title, videoIds, accessToken } = req.body;

  try {
    const response = await axios.post(
      "https://www.googleapis.com/youtube/v3/playlists",
      {
        snippet: { title },
        status: { privacyStatus: "public" },
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const playlistId = response.data.id;

    for (const videoId of videoIds) {
      await axios.post(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        { snippet: { playlistId, resourceId: { kind: "youtube#video", videoId } } },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    }

    res.json({ playlistId });
  } catch (error) {
    console.error("Error creating YouTube playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

export default router;
