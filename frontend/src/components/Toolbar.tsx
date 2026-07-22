type ToolbarProps = {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  brushSize: number;
  setBrushSize: React.Dispatch<React.SetStateAction<number>>;
  clearCanvas: () => void;
};

const COLORS = [
  "#000000",
  "#ffffff",
  "#797979",
  "#ff0000",
  "#ff7800",
  "#ffff00",
  "#00aa00",
  "#0066ff",
  "#aa00ff",
  "#ff00ff",
  "#8b4513",
];

export default function Toolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  clearCanvas,
}: ToolbarProps) {
  return (
    <div className="toolbar-card">
      <div className="color-swatches">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`color-swatch ${color === c ? "active" : ""}`}
            style={{ backgroundColor: c }}
            title={c === "#ffffff" ? "Eraser / White" : c}
          />
        ))}
      </div>

      <div className="brush-slider-group">
        <span className="slider-label">Brush:</span>
        <input
          type="range"
          min={2}
          max={30}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="brush-range"
        />
        <span className="brush-size-text">{brushSize}px</span>
      </div>

      <button onClick={clearCanvas} className="clear-btn">
        🗑️ Clear Canvas
      </button>
    </div>
  );
}