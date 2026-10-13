import { CSSProperties, FormEvent, useEffect, useState } from "react";

type ChessPiece = {
  id: string;
  symbol: string;
  side: "light" | "dark";
  row: number;
  col: number;
};

const backRank = ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"];
const whiteBackRank = ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"];

const pieces: ChessPiece[] = [
  ...backRank.map((symbol, col) => ({ id: `b-${col}`, symbol, side: "dark" as const, row: 0, col })),
  ...Array.from({ length: 8 }, (_, col) => ({ id: `bp-${col}`, symbol: "♟", side: "dark" as const, row: 1, col })),
  ...Array.from({ length: 8 }, (_, col) => ({ id: `wp-${col}`, symbol: "♙", side: "light" as const, row: 6, col })),
  ...whiteBackRank.map((symbol, col) => ({ id: `w-${col}`, symbol, side: "light" as const, row: 7, col })),
];

const movingSquares: Record<string, [number, number][]> = {
  "w-6": [[7, 6], [5, 5], [3, 4], [5, 5]],
  "b-1": [[0, 1], [2, 2], [4, 3], [2, 2]],
  "wp-3": [[6, 3], [4, 3], [4, 3], [5, 3]],
  "bp-4": [[1, 4], [3, 4], [3, 4], [2, 4]],
};

function ChessBoard({
  label,
  variant,
  searching,
  move,
}: {
  label: string;
  variant: "left" | "right";
  searching: boolean;
  move: number;
}) {
  return (
    <div className={`board-stage ${variant}`}>
      <div className="board-glow" />

      <div className="board-frame">
        <div className="board">
          {Array.from({ length: 64 }, (_, index) => (
            <div className="square" key={index}>
              <span className="square-shine" />
            </div>
          ))}

          <div className="pieces" aria-label={label}>
            {pieces.map((piece) => {
              const square = searching && movingSquares[piece.id]
                ? movingSquares[piece.id][move]
                : [piece.row, piece.col];
              const style = {
                "--row": square[0],
                "--col": square[1],
              } as CSSProperties;

              return (
                <span
                  className={`chess-piece ${piece.side}`}
                  key={piece.id}
                  style={style}
                >
                  {piece.symbol}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [move, setMove] = useState(0);

  useEffect(() => {
    if (!searching) return;
    const interval = window.setInterval(() => {
      setMove((current) => (current + 1) % 4);
    }, 1800);
    return () => window.clearInterval(interval);
  }, [searching]);

  function findOpponent(event: FormEvent) {
    event.preventDefault();
    if (username.trim()) setSearching(true);
  }

  return (
    <main className={`scene ${searching ? "searching" : ""}`}>
      <div className="boards">
        <ChessBoard label="Left chess board" variant="left" searching={searching} move={move} />

        {searching && (
          <svg className="connections" viewBox="0 -120 400 240" aria-hidden="true">
            <defs>
              <linearGradient id="energy" x1="0" x2="1">
                <stop offset="0" stopColor="#ff174f" />
                <stop offset="0.5" stopColor="#ffffff" />
                <stop offset="1" stopColor="#00c8ff" />
              </linearGradient>
              <filter id="connection-glow">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path className="connection-haze" d="M0 70 C100 -115 300 -115 400 70" />
            <path className="connection-line line-one" d="M0 70 C100 -115 300 -115 400 70" />
            <path className="connection-line line-two" d="M0 75 C125 -55 275 -55 400 75" />
            <path className="connection-line line-three" d="M0 65 C120 10 280 10 400 65" />
            <circle className="energy-dot dot-a" r="7" />
            <circle className="energy-dot dot-b" r="5" />
          </svg>
        )}

        <div className={`network-core ${searching ? "active" : ""}`} aria-hidden="true">
          <span className="network-ring network-ring-one" />
          <span className="network-ring network-ring-two" />
          <span className="network-ring network-ring-three" />
          <img src="/network-chess.png" alt="" />
        </div>

        <ChessBoard label="Right chess board" variant="right" searching={searching} move={move} />
      </div>

      <form className="matchmaking" onSubmit={findOpponent}>
        <div className="username-field">
          <input
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              setSearching(false);
            }}
            maxLength={18}
            placeholder="TYPE USERNAME"
            aria-label="Username"
            autoComplete="off"
          />
        </div>
        <button type="submit" disabled={!username.trim() || searching}>
          {searching ? (
            <span className="finding-label">FINDING OPPONENT</span>
          ) : (
            "FIND OPPONENT"
          )}
        </button>
      </form>
    </main>
  );
}
