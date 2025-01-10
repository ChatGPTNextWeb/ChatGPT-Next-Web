import { useEffect, useRef, useCallback, useState } from "react";
import styles from "./openai-voice-visualizer.module.scss";
import { initWebGL } from "../../utils/webgl";
import vertexShaderSource from "../../shaders/vertex.glsl";
import fragmentShaderSource from "../../shaders/fragment.glsl";
import { loadImage } from "canvas";

const CANVAS_SIZE = 208;
const DEFAULT_VIEWPORT_SIZE: [number, number] = [300, 300];
const NOISE_TEXTURE_OPTIONS = {
  format: "webp",
  width: 512,
  height: 512,
  space: "srgb",
  channels: 3,
  depth: "uchar",
  density: 72,
  isProgressive: false,
  paletteBitDepth: 8,
  hasProfile: false,
  hasAlpha: false,
  src: "./noise-texture.webp",
} as const;

interface ColorTheme {
  bloopColorMain: Float32Array;
  bloopColorLow: Float32Array;
  bloopColorMid: Float32Array;
  bloopColorHigh: Float32Array;
}

export interface AudioData {
  avgMag: Float32Array;
  micLevel: number;
  cumulativeAudio: Float32Array;
}

const hexToFloatArray = (hex: string): Float32Array => {
  const hexWithoutHash = hex.replace("#", "");
  const red = parseInt(hexWithoutHash.substring(0, 2), 16) / 255;
  const green = parseInt(hexWithoutHash.substring(2, 4), 16) / 255;
  const blue = parseInt(hexWithoutHash.substring(4, 6), 16) / 255;
  return new Float32Array([red, green, blue]);
};

const colorThemes = {
  BLUE: {
    bloopColorMain: hexToFloatArray("#DCF7FF"),
    bloopColorLow: hexToFloatArray("#0181FE"),
    bloopColorMid: hexToFloatArray("#A4EFFF"),
    bloopColorHigh: hexToFloatArray("#FFFDEF"),
  },
  DARK_BLUE: {
    bloopColorMain: hexToFloatArray("#DAF5FF"),
    bloopColorLow: hexToFloatArray("#0066CC"),
    bloopColorMid: hexToFloatArray("#2EC6F5"),
    bloopColorHigh: hexToFloatArray("#72EAF5"),
  },
  GREYSCALE: {
    bloopColorMain: hexToFloatArray("#D7D7D7"),
    bloopColorLow: hexToFloatArray("#303030"),
    bloopColorMid: hexToFloatArray("#989898"),
    bloopColorHigh: hexToFloatArray("#FFFFFF"),
  },
  WHITE: {
    bloopColorMain: hexToFloatArray("#FFFFFF"),
    bloopColorLow: hexToFloatArray("#FFFFFF"),
    bloopColorMid: hexToFloatArray("#FFFFFF"),
    bloopColorHigh: hexToFloatArray("#FFFFFF"),
  },
  BLACK: {
    bloopColorMain: hexToFloatArray("#000000"),
    bloopColorLow: hexToFloatArray("#000000"),
    bloopColorMid: hexToFloatArray("#000000"),
    bloopColorHigh: hexToFloatArray("#000000"),
  },
} as const;

interface OpenAIVoiceVisualizerProps {
  audioData?: AudioData;
  isActive?: boolean;
}

export class NormalBlorpUniformsSetter {
  static uniformBlockName = "BlorbUniformsObject";
  private gl: WebGL2RenderingContext;
  private uniformBuffer: WebGLBuffer;
  private uniformNames: string[];
  private uniformOffsets: { [key: string]: number };
  private dataBuffer: ArrayBuffer;
  private floatView: Float32Array;
  private intView: Int32Array;

  constructor(gl: WebGL2RenderingContext, program: WebGLProgram) {
    this.gl = gl;
    const uniformBlockIndex = gl.getUniformBlockIndex(
      program,
      NormalBlorpUniformsSetter.uniformBlockName,
    );
    const uniformBlockSize = gl.getActiveUniformBlockParameter(
      program,
      uniformBlockIndex,
      gl.UNIFORM_BLOCK_DATA_SIZE,
    );

    this.uniformBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.uniformBuffer);
    gl.bufferData(gl.UNIFORM_BUFFER, uniformBlockSize, gl.DYNAMIC_DRAW);

    const bindingPoint = 0;
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, this.uniformBuffer);
    gl.uniformBlockBinding(program, uniformBlockIndex, bindingPoint);

    const uniformIndices = gl.getActiveUniformBlockParameter(
      program,
      uniformBlockIndex,
      gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES,
    );

    this.uniformNames = [];
    this.uniformOffsets = {};
    for (let i = 0; i < uniformIndices.length; i++) {
      const uniformIndex = uniformIndices[i];
      const uniformInfo = gl.getActiveUniform(program, uniformIndex);
      if (!uniformInfo) {
        throw new Error("No uniformInfo for index " + uniformIndex);
      }
      let uniformName = uniformInfo.name;
      uniformName = uniformName.replace(/\[0\]$/, "");
      const uniformOffset = gl.getActiveUniforms(
        program,
        [uniformIndex],
        gl.UNIFORM_OFFSET,
      )[0];
      this.uniformNames.push(uniformName);
      this.uniformOffsets[uniformName] = uniformOffset;
    }

    this.dataBuffer = new ArrayBuffer(uniformBlockSize);
    this.floatView = new Float32Array(this.dataBuffer);
    this.intView = new Int32Array(this.dataBuffer);
  }

  setVariablesAndRender(variables: {
    [key: string]: number | boolean | number[];
  }) {
    for (const uniformName of this.uniformNames) {
      const [, name] = uniformName.split(".");
      const offset = this.uniformOffsets[uniformName] / 4;
      const value = variables[name];

      if (typeof value === "number") {
        this.floatView[offset] = value;
      } else if (typeof value === "boolean") {
        this.intView[offset] = value ? 1 : 0;
      } else if (Array.isArray(value)) {
        this.floatView.set(value, offset);
      }
    }

    this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.uniformBuffer);
    this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, 0, this.dataBuffer);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 6);
  }
}

export function OpenAIVoiceVisualizer({
  audioData,
  isActive,
}: OpenAIVoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number>(0);
  const uniformSetterRef = useRef<NormalBlorpUniformsSetter | null>(null);
  const startTimeRef = useRef<number>(performance.now() / 1000);
  const readyTimeRef = useRef<number>(performance.now() / 1000);

  const variablesRef = useRef({
    time: 0,
    micLevel: 0,
    stateListen: 0,
    listenTimestamp: 0,
    stateThink: 0.0,
    thinkTimestamp: 0.0,
    stateSpeak: 1,
    speakTimestamp: 0,
    readyTimestamp: 0,
    stateHalt: 0.0,
    haltTimestamp: 0.0,
    touchDownTimestamp: 0.0,
    touchUpTimestamp: 0.0,
    stateFailedToConnect: 0.0,
    failedToConnectTimestamp: 0.0,
    avgMag: new Array(4).fill(0),
    cumulativeAudio: new Array(4).fill(0),
    isNewBloop: true,
    isAdvancedBloop: true,
    bloopColorMain: [0, 0, 0],
    bloopColorLow: [0, 0, 0],
    bloopColorMid: [0, 0, 0],
    bloopColorHigh: [0, 0, 0],
    isDarkMode: false,
    screenScaleFactor: 1.0,
    viewport: DEFAULT_VIEWPORT_SIZE,
    silenceAmount: 0.0,
    silenceTimestamp: 0.0,
    fadeBloopWhileListening: false,
  });

  const audioDataRef = useRef<AudioData>({
    avgMag: new Float32Array(4),
    micLevel: 0,
    cumulativeAudio: new Float32Array(4),
  });

  const handleAudioData = useCallback((data: AudioData) => {
    audioDataRef.current = data;
  }, []);

  const [viewportSize] = useState<[number, number]>(DEFAULT_VIEWPORT_SIZE);
  const [noiseTextureImage, setNoiseTextureImage] =
    useState<HTMLImageElement | null>(null);
  const getColorTheme = useCallback((isAdvanced: boolean): ColorTheme => {
    return colorThemes.BLUE;
  }, []);

  const initializeWebGL = useCallback(() => {
    if (!canvasRef.current) return;

    const dpi = window.devicePixelRatio || 1;
    canvasRef.current.width = CANVAS_SIZE * dpi;
    canvasRef.current.height = CANVAS_SIZE * dpi;
    canvasRef.current.style.width = `${CANVAS_SIZE}px`;
    canvasRef.current.style.height = `${CANVAS_SIZE}px`;

    const { gl, program } = initWebGL(
      canvasRef.current,
      vertexShaderSource,
      fragmentShaderSource,
    );

    if (!gl || !program) {
      console.error("WebGL 初始化失败");
      return;
    }

    glRef.current = gl;
    programRef.current = program;
    uniformSetterRef.current = new NormalBlorpUniformsSetter(gl, program);

    return { gl, program };
  }, []);

  const initializeNoiseTexture = useCallback(
    (gl: WebGL2RenderingContext, program: WebGLProgram) => {
      const noiseTexture = gl.createTexture();
      if (!noiseTexture) {
        console.error("创建噪声纹理失败");
        return;
      }

      gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      if (noiseTextureImage) {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          noiseTextureImage,
        );
      }

      const location = gl.getUniformLocation(program, "uTextureNoise");
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, noiseTexture);
      gl.uniform1i(location, 0);

      return noiseTexture;
    },
    [noiseTextureImage],
  );

  const renderFrame = useCallback(() => {
    if (!glRef.current || !uniformSetterRef.current) return;

    if (!audioData) {
      handleAudioData({
        avgMag: new Float32Array(4),
        micLevel: 0,
        cumulativeAudio: new Float32Array(4),
      });
      // return;
    } else {
      handleAudioData(audioData);
    }

    const currentFrameTime = performance.now() / 1000;
    const colorTheme = getColorTheme(true);

    const variables = variablesRef.current;
    variables.time = currentFrameTime;
    variables.micLevel = audioDataRef.current.micLevel;
    variables.speakTimestamp = readyTimeRef.current;
    variables.readyTimestamp = startTimeRef.current;
    variables.avgMag = Array.from(audioDataRef.current.avgMag);
    variables.cumulativeAudio = Array.from(
      audioDataRef.current.cumulativeAudio,
    );
    variables.bloopColorMain = Array.from(colorTheme.bloopColorMain);
    variables.bloopColorLow = Array.from(colorTheme.bloopColorLow);
    variables.bloopColorMid = Array.from(colorTheme.bloopColorMid);
    variables.bloopColorHigh = Array.from(colorTheme.bloopColorHigh);
    variables.screenScaleFactor = window.devicePixelRatio || 1.0;
    variables.viewport = viewportSize;

    uniformSetterRef.current.setVariablesAndRender(variables);
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [audioData, getColorTheme, handleAudioData, viewportSize]);

  useEffect(() => {
    const loadNoiseTexture = async () => {
      try {
        const image = await loadImage(NOISE_TEXTURE_OPTIONS.src);
        setNoiseTextureImage(image as unknown as HTMLImageElement);
      } catch (error) {
        console.error("加载噪声纹理失败:", error);
      }
    };
    loadNoiseTexture();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const webglContext = initializeWebGL();
    if (!webglContext) return;

    const { gl, program } = webglContext;
    const noiseTexture = initializeNoiseTexture(gl, program);

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (gl) {
        if (noiseTexture) {
          gl.deleteTexture(noiseTexture);
        }
        gl.deleteProgram(program);
      }
    };
  }, [
    initializeWebGL,
    initializeNoiseTexture,
    renderFrame,
    audioData,
    isActive,
  ]);

  return (
    <div className={styles["openai-voice-visualizer"]}>
      <canvas ref={canvasRef} />
    </div>
  );
}
