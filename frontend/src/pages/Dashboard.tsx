import React, { useState } from "react";
import PlaylistSelector from "../components/PlaylistSelector";
import VideoSearch from "../components/VideoSearch";
import YouTubePlaylist from "../components/YoutubePlaylist";

const Dashboard: React.FC<{ token: string }> = ({ token }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  return (
    <div>
      {!selectedPlaylist ? (
        <PlaylistSelector token={token} onSelect={setSelectedPlaylist} />
      ) : (
        <>
          <VideoSearch onSelect={(videoId) => console.log("Selected video:", videoId)} />
          <YouTubePlaylist token={token} />
        </>
      )}
    </div>
  );
};

export default Dashboard;
