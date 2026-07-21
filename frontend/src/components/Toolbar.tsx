type ToolbarProps = {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  brushSize: number;
  setBrushSize: React.Dispatch<React.SetStateAction<number>>;
  clearCanvas: () => void;
};

const COLORS = [
  "#000000",
  "#ff0000",
  "#0066ff",
  "#00aa00",
  "#ffff00",
  "#ff00ff",
];

export default function Toolbar({
  color,
  setColor,
  brushSize,
  setBrushSize,
  clearCanvas,
}: ToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        alignItems: "center",
        padding: 10,
        borderTop: "1px solid #ccc",
      }}
    >
      <div style={{ display: "flex", gap: 10 }}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: c,
              border:
                color === c
                  ? "3px solid #444"
                  : "1px solid #ccc",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <div>
        Brush:
        <input
          type="range"
          min={2}
          max={20}
          value={brushSize}
          onChange={(e) =>
            setBrushSize(Number(e.target.value))
          }
        />
        {brushSize}px
      </div>

      <button onClick={clearCanvas}>
        Clear
      </button>
    </div>
  );
}