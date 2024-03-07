import axios from "axios";
import { useEffect, useState } from "react";

export function Stream() {
  const [selectPathStream, setSelectPathStream] = useState("");
  const [typeStream, setTypeStream] = useState(1);

  const setStreambot = (data) => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setSelectPathStream(data[randomIndex]);
    setTypeStream(1);
  };

  const getPathVidStream = async (headers) => {
    try {
      const res = await axios.get(process.env.STREAMBOT, { headers });
      const data = res.data.message;
      setStreambot(data);
    } catch (e) {
      console.log(e);
    }
  };

  const handleChanglePathVid = () => {
    const pathVidOnClient = localStorage.getItem("pathVidStream");
    if (pathVidOnClient && pathVidOnClient !== selectPathStream) {
      setSelectPathStream(pathVidOnClient);
    }
  };

  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: process.env.TOKENHIPPO,
    };
    localStorage.setItem("pathVidStream", "");

    getPathVidStream(headers);
  }, []);

  return (
    <>
      {selectPathStream ? (
        <div className="cam-stream">
          <video
            key={selectPathStream}
            autoPlay
            muted
            loop
            onTimeUpdate={handleChanglePathVid}
          >
            <source src={selectPathStream} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
}
