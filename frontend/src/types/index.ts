export type Player = {
  id: string;
  name: string;
  score: number;
  guessed: boolean;
};

export type RoomType = {
  id: string;
  hostId: string;
  players: Player[];
  drawerId: string | null;
  currentRound: number;
  maxRounds: number;
  currentWord: string | null;
  wordChoices: string[];
  gameStarted: boolean;
  timer: number;
};

export type Stroke = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
  width: number;
};

export type ChatMessage = {
  sender: string;
  message: string;
  isSystem?: boolean;
  isCorrectGuess?: boolean;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
};

export type AuthUser = {
  email: string;
  name: string;
  token: string;
};
