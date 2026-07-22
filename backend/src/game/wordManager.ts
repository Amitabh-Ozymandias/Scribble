import { WORDS } from "./words";

const categories = Object.keys(WORDS);

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export function getRandomWords(count = 3): string[] {
  const category =
    categories[Math.floor(Math.random() * categories.length)];

  const words = WORDS[category as keyof typeof WORDS];

  return shuffle(words).slice(0, count);
}