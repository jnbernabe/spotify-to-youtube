import express from "express";
import axios, { Axios, AxiosError } from "axios";
import dotenv from "dotenv";
import querystring from "querystring";

dotenv.config();

const router = express.Router();
const YOUTUBE_PLAYLIST_URL = "https://www.googleapis.com/youtube/v3/playlists";
const YOUTUBE_PLAYLIST_ITEMS_URL = "https://www.googleapis.com/youtube/v3/playlistItems";
const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
const YOUTUBE_REDIRECT_URI = process.env.PROD ? process.env.PROD_YOUTUBE_REDIRECT_URI : process.env.LOCAL_YOUTUBE_REDIRECT_URI!;
const FRONTEND_URI = process.env.PROD ? process.env.PROD_FRONT_END : process.env.LOCAL_FRONT_END; //

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
    console.log("User Logged In with Youtube");
    res.redirect(`${FRONTEND_URI}/dashboard?youtube_access_token=${access_token}&youtube_refresh_token=${refresh_token}`);
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
    console.log("Tokens Refreshed");
    res.json({ access_token });
  } catch (error) {
    console.error("Error refreshing YouTube token:", error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
};

router.get("/refresh_token", refreshTokens);

const youtubeSearch: express.RequestHandler = async (req, res): Promise<any> => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await axios.get(YOUTUBE_SEARCH_URL, {
      params: {
        q: query,
        key: YOUTUBE_API_KEY,
        part: "snippet",
        maxResults: 1,
        type: "video",
      },
    });

    if (!response.data.items.length) {
      return res.status(404).json({ error: "No YouTube video found for this query." });
    }
    console.log("Found YouTube video");
    res.json(response.data.items[0]);
  } catch (error: any) {
    if (error.response.status === 403) {
      return res.status(403).json({ error: "403 Forbidden. YouTube API limit exceeded." });
    }
    res.status(500).json({ error: "Failed to fetch YouTube video." });
  }
};
router.get("/search", youtubeSearch);

// Create a YouTube Playlist and Add Videos
const createPlaylist: express.RequestHandler = async (req, res): Promise<any> => {
  const { title, videoIds, accessToken } = req.body;
  if (!title || !videoIds || !accessToken) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Step 1: Create Playlist**
    const createResponse = await axios.post(
      `${YOUTUBE_PLAYLIST_URL}?part=snippet`, // ✅ Corrected part parameter
      {
        snippet: {
          title: title,
          description: "Playlist created via API",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const playlistId = createResponse.data.id;
    console.log(`Playlist Created: ${playlistId}`);

    // Step 2: Add Videos to Playlist**
    for (const videoId of videoIds) {
      await axios.post(
        `${YOUTUBE_PLAYLIST_ITEMS_URL}?part=snippet`, // ✅ Corrected part parameter
        {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: videoId,
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("All videos added to playlist.");
    res.json({ success: true, playlistId, title });
  } catch (error: AxiosError | any) {
    console.error("YouTube API Error:", error.code, error.message, error.errors);
    //console.error("Failed to create YouTube playlist:", error.data);
    res.status(500).json({ error: error.response?.data || error.message });
  }
};
router.post("/create-playlist", createPlaylist);

export default router;
