import express, { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;

const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

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
