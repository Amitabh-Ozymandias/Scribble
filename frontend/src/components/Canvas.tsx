import { useEffect, useRef } from "react";
import { socket } from "../socket";
import type { Stroke } from "../types/stroke";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDrawing = useRef(false);

  const lastPoint = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 500;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
  }, []);

  useEffect(() => {
    function handleRemoteDraw(stroke: Stroke) {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(stroke.x0, stroke.y0);
      ctx.lineTo(stroke.x1, stroke.y1);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.stroke();
    }

    socket.on("draw", handleRemoteDraw);

    return () => {
      socket.off("draw", handleRemoteDraw);
    };
  }, []);

  function getPosition(
    e: React.PointerEvent<HTMLCanvasElement>
  ) {
    const rect = e.currentTarget.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function handlePointerDown(
    e: React.PointerEvent<HTMLCanvasElement>
  ) {
    const pos = getPosition(e);

    isDrawing.current = true;

    lastPoint.current = pos;
  }

  function handlePointerMove(
    e: React.PointerEvent<HTMLCanvasElement>
  ) {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const current = getPosition(e);

    // Draw locally
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    // Create stroke packet
    const stroke: Stroke = {
      x0: lastPoint.current.x,
      y0: lastPoint.current.y,
      x1: current.x,
      y1: current.y,
      color: "#000",
      width: 4,
    };

    // Send to backend
    socket.emit("draw", stroke);

    // Update previous point
    lastPoint.current = current;
  }

  function stopDrawing() {
    isDrawing.current = false;
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrawing}
      onPointerLeave={stopDrawing}
      style={{
        border: "2px solid black",
        background: "white",
        cursor: "crosshair",
      }}
    />
  );
}
