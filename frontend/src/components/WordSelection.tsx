type Props = {
  words: string[];
  onSelect: (word: string) => void;
};

export default function WordSelection({ words, onSelect }: Props) {
  return (
    <div className="word-selection-overlay">
      <div className="word-selection-card">
        <h2 className="word-selection-title">Choose a word to draw!</h2>
        <p className="word-selection-subtitle">Select one of the options below:</p>

        <div className="word-buttons-group">
          {words.map((word) => (
            <button
              key={word}
              onClick={() => onSelect(word)}
              className="word-choice-btn"
            >
              {word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}