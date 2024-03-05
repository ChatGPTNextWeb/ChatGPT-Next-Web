import axios from "axios";
import { useEffect, useState } from "react";
import { handleComfyui } from "../../configfunc";

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
  }, []);

  return (
    <>
      {selectPathStream &&
        (typeStream ? (
          <div className="cam-stream">
            <video autoPlay muted loop>
              <source src={selectPathStream} type="video/mp4" />
            </video>
          </div>
        ) : (
          <div className="cam-stream">
            <img
              src={selectPathStream}
              alt="Image Stream"
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
    </>
  );
}
