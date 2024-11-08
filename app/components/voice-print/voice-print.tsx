import { useEffect, useRef } from "react";
import styles from "./voice-print.module.scss";

interface VoicePrintProps {
  frequencies?: Uint8Array;
  isActive?: boolean;
}

export function VoicePrint({ frequencies, isActive }: VoicePrintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[][]>([]); // 存储历史频率数据，用于平滑处理
  const historyLengthRef = useRef(10); // 历史数据保留帧数，影响平滑程度
  const animationFrameRef = useRef<number>(); // 用于管理动画帧
  const currentFrequenciesRef = useRef<Uint8Array>(); // 当前频率数据的引用
  const amplitudeMultiplier = useRef(1.5); // 波形振幅倍数，控制波形高度

  // 更新频率数据的副作用
  useEffect(() => {
    if (!frequencies || !isActive) {
      historyRef.current = [];
      currentFrequenciesRef.current = undefined;
      return;
    }

    currentFrequenciesRef.current = frequencies;
    const freqArray = Array.from(frequencies);
    const newHistory = [...historyRef.current, freqArray];
    if (newHistory.length > historyLengthRef.current) {
      newHistory.shift();
    }
    historyRef.current = newHistory;
  }, [frequencies, isActive]);

  // 渲染函数：负责绘制声纹动画
  const render = () => {
    const canvas = canvasRef.current;
    const frequencies = currentFrequenciesRef.current;

    if (!canvas || !frequencies || !isActive) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const points: [number, number][] = [];
    const centerY = canvas.height / 2;
    const width = canvas.width;

    // 频率采样处理
    // 将输入的频率数据重采样为128个点，减少计算量并保持显示效果
    const frequencyStep = Math.ceil(frequencies.length / 128); // 计算采样间隔
    const effectiveFrequencies = Array.from(
      { length: 128 },
      (_, i) => frequencies[i * frequencyStep] || 0,
    );

    // 计算每个频率点在画布上的水平间距
    const sliceWidth = width / (effectiveFrequencies.length - 1);

    ctx.beginPath();
    ctx.moveTo(0, centerY);

    // 遍历采样后的频率数据，计算并绘制波形
    for (let i = 0; i < effectiveFrequencies.length; i++) {
      const x = i * sliceWidth;
      let avgFrequency = effectiveFrequencies[i];

      // 使用历史数据进行平滑处理
      // 当前值权重为2，历史数据权重为1，实现平滑过渡
      if (historyRef.current.length > 0) {
        const historicalValues = historyRef.current.map(
          (h) => h[i * frequencyStep] || 0,
        );
        avgFrequency =
          (avgFrequency * 2 + historicalValues.reduce((a, b) => a + b, 0)) /
          (historyRef.current.length + 2);
      }

      // 波形计算
      const normalized = Math.pow(avgFrequency / 255.0, 1.1); // 使用幂函数增强对比度
      const height =
        normalized * (canvas.height / 2) * amplitudeMultiplier.current;
      // 使用正弦函数创建波动效果，i * 0.15控制波形密度，Date.now() * 0.003控制波动速度
      const y = centerY + height * Math.sin(i * 0.15 + Date.now() * 0.003);

      points.push([x, y]);

      // 使用贝塞尔曲线绘制平滑波形
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const prevPoint = points[i - 1];
        const midX = (prevPoint[0] + x) / 2;
        // 二次贝塞尔曲线，使用中点作为控制点
        ctx.quadraticCurveTo(
          prevPoint[0],
          prevPoint[1],
          midX,
          (prevPoint[1] + y) / 2,
        );
      }
    }

    // 绘制对称的下半部分波形，创建镜像效果
    for (let i = points.length - 1; i >= 0; i--) {
      const [x, y] = points[i];
      const symmetricY = centerY - (y - centerY);
      if (i === points.length - 1) {
        ctx.lineTo(x, symmetricY);
      } else {
        const nextPoint = points[i + 1];
        const midX = (nextPoint[0] + x) / 2;
        ctx.quadraticCurveTo(
          nextPoint[0],
          centerY - (nextPoint[1] - centerY),
          midX,
          centerY - ((nextPoint[1] + y) / 2 - centerY),
        );
      }
    }

    ctx.closePath();

    // 创建水平渐变效果
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(100, 180, 255, 0.95)"); // 左侧颜色
    gradient.addColorStop(0.5, "rgba(140, 200, 255, 0.9)"); // 中间颜色
    gradient.addColorStop(1, "rgba(180, 220, 255, 0.95)"); // 右侧颜色

    ctx.fillStyle = gradient;
    ctx.fill();

    animationFrameRef.current = requestAnimationFrame(render);
  };

  // 初始化canvas和动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 处理高DPI显示器
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className={styles["voice-print"]}>
      <canvas ref={canvasRef} />
    </div>
  );
}
