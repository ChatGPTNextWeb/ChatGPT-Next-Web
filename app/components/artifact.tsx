import { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router";
import { useWindowSize } from "@/app/utils";
import { IconButton } from "./button";
import { nanoid } from "nanoid";
import ExportIcon from "../icons/share.svg";
import CopyIcon from "../icons/copy.svg";
import DownloadIcon from "../icons/download.svg";
import GithubIcon from "../icons/github.svg";
import LoadingButtonIcon from "../icons/loading.svg";
import Locale from "../locales";
import { Modal, showToast } from "./ui-lib";
import { copyToClipboard, downloadAs } from "../utils";
import { Path, ApiPath, REPO_URL } from "@/app/constant";
import { Loading } from "./home";
import styles from "./artifact.module.scss";

export function HTMLPreview(props: {
  code: string;
  autoHeight?: boolean;
  height?: number;
  onLoad?: (title?: string) => void;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const frameId = useRef<string>(nanoid());
  const [iframeHeight, setIframeHeight] = useState(600);
  const [title, setTitle] = useState("");
  /*
   * https://stackoverflow.com/questions/19739001/what-is-the-difference-between-srcdoc-and-src-datatext-html-in-an
   * 1. using srcdoc
   * 2. using src with dataurl:
   *    easy to share
   *    length limit (Data URIs cannot be larger than 32,768 characters.)
   */

  useEffect(() => {
    const handleMessage = (e: any) => {
      const { id, height, title } = e.data;
      setTitle(title);
      if (id == frameId.current) {
        setIframeHeight(height);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const height = useMemo(() => {
    const parentHeight = props.height || 600;
    if (props.autoHeight !== false) {
      return iframeHeight + 40 > parentHeight
        ? parentHeight
        : iframeHeight + 40;
    } else {
      return parentHeight;
    }
  }, [props.autoHeight, props.height, iframeHeight]);

  const srcDoc = useMemo(() => {
    const script = `<script>new ResizeObserver((entries) => parent.postMessage({id: '${frameId.current}', height: entries[0].target.clientHeight}, '*')).observe(document.body)</script>`;
    if (props.code.includes("</head>")) {
      props.code.replace("</head>", "</head>" + script);
    }
    return props.code + script;
  }, [props.code]);

  const handleOnLoad = () => {
    if (props?.onLoad) {
      props.onLoad(title);
    }
  };

  return (
    <iframe
      className={styles["artifact-iframe"]}
      id={frameId.current}
      ref={ref}
      sandbox="allow-forms allow-modals allow-scripts"
      style={{ height }}
      srcDoc={srcDoc}
      onLoad={handleOnLoad}
    />
  );
}

export function ArtifactShareButton({
  getCode,
  id,
  style,
  fileName,
}: {
  getCode: () => string;
  id?: string;
  style?: any;
  fileName?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(id);
  const [show, setShow] = useState(false);
  const shareUrl = useMemo(
    () => [location.origin, "#", Path.Artifact, "/", name].join(""),
    [name],
  );
  const upload = (code: string) =>
    id
      ? Promise.resolve({ id })
      : fetch(ApiPath.Artifact, {
          method: "POST",
          body: code,
        })
          .then((res) => res.json())
          .then(({ id }) => {
            if (id) {
              return { id };
            }
            throw Error();
          })
          .catch((e) => {
            showToast(Locale.Export.Artifact.Error);
          });
  return (
    <>
      <div className="window-action-button" style={style}>
        <IconButton
          icon={loading ? <LoadingButtonIcon /> : <ExportIcon />}
          bordered
          title={Locale.Export.Artifact.Title}
          onClick={() => {
            setLoading(true);
            upload(getCode())
              .then((res) => {
                if (res?.id) {
                  setShow(true);
                  setName(res?.id);
                }
              })
              .finally(() => setLoading(false));
          }}
        />
      </div>
      {show && (
        <div className="modal-mask">
          <Modal
            title={Locale.Export.Artifact.Title}
            onClose={() => setShow(false)}
            actions={[
              <IconButton
                key="download"
                icon={<DownloadIcon />}
                bordered
                text={Locale.Export.Download}
                onClick={() => {
                  downloadAs(getCode(), `${fileName || name}.html`).then(() =>
                    setShow(false),
                  );
                }}
              />,
              <IconButton
                key="copy"
                icon={<CopyIcon />}
                bordered
                text={Locale.Chat.Actions.Copy}
                onClick={() => {
                  copyToClipboard(shareUrl).then(() => setShow(false));
                }}
              />,
            ]}
          >
            <div>
              <a target="_blank" href={shareUrl}>
                {shareUrl}
              </a>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
}

export function Artifact() {
  const { id } = useParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileName, setFileName] = useState("");
  const { height } = useWindowSize();

  useEffect(() => {
    if (id) {
      fetch(`${ApiPath.Artifact}?id=${id}`)
        .then((res) => {
          if (res.status > 300) {
            throw Error("can not get content");
          }
          return res;
        })
        .then((res) => res.text())
        .then(setCode)
        .catch((e) => {
          showToast(Locale.Export.Artifact.Error);
        });
    }
  }, [id]);

  return (
    <div className={styles.artifact}>
      <div
        style={{
          height: 36,
          display: "flex",
          alignItems: "center",
          padding: 12,
        }}
      >
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          <IconButton bordered icon={<GithubIcon />} shadow />
        </a>
        <div style={{ flex: 1, textAlign: "center" }}>NextChat Artifact</div>
        <ArtifactShareButton id={id} getCode={() => code} fileName={fileName} />
      </div>
      {loading && <Loading />}
      {code && (
        <HTMLPreview
          code={code}
          autoHeight={false}
          height={height - 36}
          onLoad={(title) => {
            setFileName(title as string);
            setLoading(false);
          }}
        />
      )}
    </div>
  );
}
