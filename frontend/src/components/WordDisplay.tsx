type Props = {
  myWord: string;
  wordLength: number;
  revealedWord?: string;
  isDrawer: boolean;
};

export default function WordDisplay({
  myWord,
  wordLength,
  revealedWord,
  isDrawer,
}: Props) {
  if (revealedWord) {
    return (
      <div className="word-display revealed">
        <span className="word-hint-label">Word was:</span>
        <span className="word-text">{revealedWord.toUpperCase()}</span>
      </div>
    );
  }

  if (isDrawer) {
    return (
      <div className="word-display drawer">
        <span className="word-hint-label">Your word:</span>
        <span className="word-text">
          {myWord ? myWord.toUpperCase() : "Select a word..."}
        </span>
      </div>
    );
  }

  return (
    <div className="word-display guesser">
      <span className="word-hint-label">Guess the word:</span>
      <span className="word-blanks">
        {wordLength > 0
          ? "_ ".repeat(wordLength).trim()
          : "Waiting for word selection..."}
      </span>
    </div>
  );
}