

type ToolbarProps = {
  color: string;
  setColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  isEraser: boolean;
  setIsEraser: (eraser: boolean) => void;
  clearCanvas: () => void;
};

const PALETTE = [
  "#000000", // Black
  "#ffffff", // White
  "#64748b", // Slate
  "#ef4444", // Red
  "#b91c1c", // Dark Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#15803d", // Dark Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#1d4ed8", // Dark Blue
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#84cc16", // Lime
  "#78350f", // Brown
];

const BRUSH_PRESETS = [
  { label: "S", size: 4 },
  { label: "M", size: 8 },
  { label: "L", size: 16 },
  { label: "XL", size: 28 },
];

export default function Toolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  isEraser,
  setIsEraser,
  clearCanvas,
}: ToolbarProps) {
  return (
    <div className="toolbar-card">
      {/* Tool Toggle: Brush vs Eraser */}
      <div className="tool-mode-group">
        <button
          className={`tool-btn ${!isEraser ? "active" : ""}`}
          onClick={() => setIsEraser(false)}
          title="Brush Tool"
        >
          ✏️ Brush
        </button>
        <button
          className={`tool-btn ${isEraser ? "active" : ""}`}
          onClick={() => setIsEraser(true)}
          title="Eraser Tool"
        >
          🧹 Eraser
        </button>
      </div>

      {/* Color Palette Grid */}
      <div className="color-swatches-grid">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => {
              setColor(c);
              setIsEraser(false);
            }}
            className={`color-swatch ${!isEraser && color === c ? "active" : ""}`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Brush Size Presets & Slider */}
      <div className="brush-controls-group">
        <div className="preset-buttons">
          {BRUSH_PRESETS.map((preset) => (
            <button
              key={preset.size}
              className={`preset-btn ${brushSize === preset.size ? "active" : ""}`}
              onClick={() => setBrushSize(preset.size)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="brush-slider-wrapper">
          <input
            type="range"
            min={2}
            max={36}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="brush-range"
          />
          <span className="brush-size-text">{brushSize}px</span>
        </div>
      </div>

      {/* Actions */}
      <button onClick={clearCanvas} className="clear-btn" title="Clear entire canvas">
        🗑️ Clear
      </button>
    </div>
  );
}