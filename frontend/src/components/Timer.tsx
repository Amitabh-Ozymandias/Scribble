type Props = {
  time: number;
};

export default function Timer({ time }: Props) {
  const isUrgent = time <= 10;

  return (
    <div className={`timer-badge ${isUrgent ? "urgent" : ""}`}>
      <span className="timer-icon">⏳</span>
      <span className="timer-count">{time}s</span>
    </div>
  );
}