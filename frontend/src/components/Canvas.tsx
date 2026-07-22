import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";
import type { Stroke, RoomType } from "../types";
import Toolbar from "./Toolbar";

type CanvasProps = {
  room: RoomType;
};

export default function Canvas({ room }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const canDraw = socket.id === room.drawerId && !!room.currentWord;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 500;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
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

    function clearCanvasLocal() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    socket.on("draw", handleRemoteDraw);
    socket.on("clear-canvas", clearCanvasLocal);

    return () => {
      socket.off("draw", handleRemoteDraw);
      socket.off("clear-canvas", clearCanvasLocal);
    };
  }, []);

  function getPosition(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = e.currentTarget.width / rect.width;
    const scaleY = e.currentTarget.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!canDraw) return;
    const pos = getPosition(e);

    isDrawing.current = true;
    lastPoint.current = pos;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current || !canDraw) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const current = getPosition(e);

    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    const stroke: Stroke = {
      x0: lastPoint.current.x,
      y0: lastPoint.current.y,
      x1: current.x,
      y1: current.y,
      color,
      width: brushSize,
    };

    socket.emit("draw", stroke);
    lastPoint.current = current;
  }

  function stopDrawing() {
    isDrawing.current = false;
  }

  function clearCanvas() {
    if (!canDraw) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    socket.emit("clear-canvas");
  }

  return (
    <div className="canvas-wrapper">
      {canDraw && (
        <Toolbar
          color={color}
          setColor={setColor}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          clearCanvas={clearCanvas}
        />
      )}

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className={`game-canvas ${canDraw ? "drawable" : "readonly"}`}
        />
        {!canDraw && !room.currentWord && (
          <div className="canvas-status-overlay">
            Wait for the drawer to select a word...
          </div>
        )}
      </div>
    </div>
  );
}