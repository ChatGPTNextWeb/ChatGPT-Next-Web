import { useEffect, useState } from "react";
import { getPathVidStream } from "../../api/hippo/hippofunc";

export function Stream() {
  const [selectPathStream, setSelectPathStream] = useState("");
  const [typeStream, setTypeStream] = useState(1);

  const setStreambot = (data) => {
    const randomIndex = Math.floor(Math.random() * data.length);
    setSelectPathStream(data[randomIndex]);
    setTypeStream(1);
  };

  const handleChanglePathVid = () => {
    const pathVidOnClient = localStorage.getItem("pathVidStream");
    if (pathVidOnClient && pathVidOnClient !== selectPathStream) {
      setSelectPathStream(pathVidOnClient);
    }
  };
  const getData = async () => {
    const result = await getPathVidStream();
    setStreambot(result);
  };

  useEffect(() => {
    localStorage.setItem("pathVidStream", "");
    getData();
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
