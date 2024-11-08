import { useEffect, useRef, useState } from "react";
import styles from "./voice-print.module.scss";

interface VoicePrintProps {
  frequencies?: Uint8Array;
  isActive?: boolean;
}

export function VoicePrint({ frequencies, isActive }: VoicePrintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<number[][]>([]);
  const historyLengthRef = useRef(10); // 保存10帧历史数据

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 设置canvas尺寸
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!frequencies || !isActive) {
      setHistory([]); // 重置历史数据
      return;
    }

    // 更新历史数据
    const freqArray = Array.from(frequencies);
    setHistory((prev) => {
      const newHistory = [...prev, freqArray];
      if (newHistory.length > historyLengthRef.current) {
        newHistory.shift();
      }
      return newHistory;
    });

    // 绘制声纹
    const points: [number, number][] = [];
    const centerY = canvas.height / 2;
    const width = canvas.width;
    const sliceWidth = width / (frequencies.length - 1);

    // 绘制主波形
    ctx.beginPath();
    ctx.moveTo(0, centerY);

    // 使用历史数据计算平均值实现平滑效果
    for (let i = 0; i < frequencies.length; i++) {
      const x = i * sliceWidth;
      let avgFrequency = frequencies[i];

      // 计算历史数据的平均值
      if (history.length > 0) {
        const historicalValues = history.map((h) => h[i] || 0);
        avgFrequency =
          (avgFrequency + historicalValues.reduce((a, b) => a + b, 0)) /
          (history.length + 1);
      }

      // 使用三角函数使波形更自然
      const normalized = avgFrequency / 255.0;
      const height = normalized * (canvas.height / 2);
      const y = centerY + height * Math.sin(i * 0.2 + Date.now() * 0.002);

      points.push([x, y]);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // 使用贝塞尔曲线使波形更平滑
        const prevPoint = points[i - 1];
        const midX = (prevPoint[0] + x) / 2;
        ctx.quadraticCurveTo(
          prevPoint[0],
          prevPoint[1],
          midX,
          (prevPoint[1] + y) / 2,
        );
      }
    }

    // 绘制对称的下半部分
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

    // 设置渐变色和透明度
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "rgba(100, 180, 255, 0.95)");
    gradient.addColorStop(0.5, "rgba(140, 200, 255, 0.9)");
    gradient.addColorStop(1, "rgba(180, 220, 255, 0.95)");

    ctx.fillStyle = gradient;
    ctx.fill();
  }, [frequencies, isActive, history]);

  return (
    <div className={styles["voice-print"]}>
      <canvas ref={canvasRef} />
    </div>
  );
}
