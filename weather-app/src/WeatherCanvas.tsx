import { useEffect, useRef } from "react";

type Props = {
    theme: "snow" | "rain" | "thunder" | string;
};

export default function WeatherCanvas({ theme }: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const { width, height } = canvas;

        let animationFrameId: number;
        const particles: any[] = [];

        // 초기화
        if (theme === "snow") {
            for (let i = 0; i < 80; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    r: 2 + Math.random() * 4,
                    speedY: 0.5 + Math.random(),
                    drift: Math.random() * 0.5,
                });
            }
        } else if (theme === "rain" || theme === "thunder") {
            for (let i = 0; i < 200; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    len: 10 + Math.random() * 20,
                    speedY: 4 + Math.random() * 4,
                });
            }
        }

        // 번개 함수
        const drawLightning = () => {
            ctx.strokeStyle = "rgba(255,255,255,0.9)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            let x = Math.random() * width; // 시작 x
            let y = 0;
            ctx.moveTo(x, y);

            while (y < height) {
                x += (Math.random() - 0.5) * 40; // 좌우로 흔들림
                y += 20 + Math.random() * 30;   // 아래로 진행
                ctx.lineTo(x, y);
            }

            ctx.stroke();

            // 플래시 효과
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(0, 0, width, height);
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            if (theme === "snow") {
                ctx.fillStyle = "white";
                particles.forEach((p) => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();

                    p.y += p.speedY;
                    p.x += Math.sin(p.y * 0.01) * p.drift;

                    if (p.y > height) {
                        p.y = -10;
                        p.x = Math.random() * width;
                    }
                });
            }

            if (theme === "rain" || theme === "thunder") {
                ctx.strokeStyle = "rgba(255,255,255,0.6)";
                ctx.lineWidth = 1.5;
                particles.forEach((p) => {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y + p.len);
                    ctx.stroke();

                    p.y += p.speedY;
                    if (p.y > height) {
                        p.y = -20;
                        p.x = Math.random() * width;
                    }
                });
            }

            if (theme === "thunder") {
                if (Math.random() < 0.02) {
                    drawLightning();
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animationFrameId);
    }, [theme]);

    return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{ position: "absolute", top: 0, left: 0 }} />;
}
