"use client";

import { useEffect, useRef } from "react";

interface VoiceWaveformProps {
	analyserNode: AnalyserNode | null;
}

export function VoiceWaveform({ analyserNode }: VoiceWaveformProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number>(0);

	useEffect(() => {
		if (!analyserNode || !canvasRef.current) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const bufferLength = analyserNode.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);

		const draw = () => {
			animationRef.current = requestAnimationFrame(draw);
			analyserNode.getByteFrequencyData(dataArray);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const barCount = 32;
			const barWidth = canvas.width / barCount - 2;
			const centerY = canvas.height / 2;

			for (let i = 0; i < barCount; i++) {
				const dataIndex = Math.floor((i * bufferLength) / barCount);
				const value = dataArray[dataIndex];
				const barHeight = (value / 255) * (canvas.height / 2 - 10) + 4;

				const gradient = ctx.createLinearGradient(
					0,
					centerY - barHeight,
					0,
					centerY + barHeight,
				);
				gradient.addColorStop(0, "#B552D9");
				gradient.addColorStop(1, "#FA8485");

				ctx.fillStyle = gradient;
				ctx.beginPath();
				ctx.roundRect(
					i * (barWidth + 2) + 1,
					centerY - barHeight,
					barWidth,
					barHeight * 2,
					4,
				);
				ctx.fill();
			}
		};

		draw();

		return () => {
			cancelAnimationFrame(animationRef.current);
		};
	}, [analyserNode]);

	return (
		<canvas ref={canvasRef} width={240} height={80} className="rounded-lg" />
	);
}
