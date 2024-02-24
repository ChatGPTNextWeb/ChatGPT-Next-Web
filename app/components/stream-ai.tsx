import axios from "axios";
import { useEffect, useState, useRef } from "react";

export function Stream() {
  const [allPathStream, setAllPathStream] = useState([]);
  const [selectPathStream, setSelectPathStream] = useState("");
  const videoRef = useRef(null);

  const setStreambot = (data) => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setSelectPathStream(data[randomIndex]);
  };

  const getPathVidStream = async (headers) => {
    try {
      const res = await axios.get(process.env.STREAMBOT, { headers });
      const data = res.data.message;
      setStreambot(data);
      setAllPathStream(data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: process.env.TOKENHIPPO,
    };
    getPathVidStream(headers);

    if (videoRef.current) {
      videoRef.current.addEventListener("ended", handleVideoEnded);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleVideoEnded);
      }
    };
  }, []);

  return (
    <>
      {selectPathStream ? (
        <div className="cam-stream">
          <video autoPlay muted loop>
            <source src={selectPathStream} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}
