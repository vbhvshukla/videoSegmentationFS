import { useRef, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import VideoPlayer from "./VideoPlayer";

function App() {
  const playerRef = useRef(null);
  const videoLink =
    "http://localhost:8000/uploads/course/82279a99-d6d5-461a-8777-b502323902f4/index.m3u8";
  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL",
      },
    ],
  };
  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };
  return (
    <>
      <div>
        <h1>Video player</h1>
        <h2>Video Segmentation Visualiser</h2>
        <h3>Goto Console -> Network to view how to segments of a video load and plays!</h3>
      </div>

      <VideoPlayer options={videoPlayerOptions} onReady={handlePlayerReady} />
    </>
  );
}

export default App;
