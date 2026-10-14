import { CSSProperties, FormEvent, useEffect, useState } from "react";

type ChessPiece = {
  id: string;
  symbol: string;
  side: "light" | "dark";
  row: number;
  col: number;
};

const blackRank = ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"];
const whiteRank = ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"];

const pieces: ChessPiece[] = [
  ...blackRank.map((symbol, col) => ({ id: `b-${col}`, symbol, side: "dark" as const, row: 0, col })),
  ...Array.from({ length: 8 }, (_, col) => ({ id: `bp-${col}`, symbol: "♟", side: "dark" as const, row: 1, col })),
  ...Array.from({ length: 8 }, (_, col) => ({ id: `wp-${col}`, symbol: "♙", side: "light" as const, row: 6, col })),
  ...whiteRank.map((symbol, col) => ({ id: `w-${col}`, symbol, side: "light" as const, row: 7, col })),
];

const featuredMoves: Record<string, [number, number][]> = {
  "b-1": [[0, 1], [2, 2], [4, 3], [2, 2]],
  "b-6": [[0, 6], [2, 5], [3, 7], [2, 5]],
  "w-1": [[7, 1], [5, 2], [3, 3], [5, 2]],
  "w-6": [[7, 6], [5, 5], [3, 4], [5, 5]],
};

function getSquare(piece: ChessPiece, move: number, searching: boolean) {
  if (!searching) return [piece.row, piece.col];
  if (featuredMoves[piece.id]) return featuredMoves[piece.id][move];
  if (piece.id.startsWith("bp-")) return [[1, piece.col], [2, piece.col], [3, piece.col], [2, piece.col]][move];
  if (piece.id.startsWith("wp-")) return [[6, piece.col], [5, piece.col], [4, piece.col], [5, piece.col]][move];
  return [piece.row, piece.col];
}

export default function App() {
  const [username, setUsername] = useState("");
  const [searching, setSearching] = useState(false);
  const [move, setMove] = useState(0);

  useEffect(() => {
    if (!searching) return;
    const interval = window.setInterval(() => {
      setMove((current) => (current + 1) % 4);
    }, 1700);
    return () => window.clearInterval(interval);
  }, [searching]);

  function findOpponent(event: FormEvent) {
    event.preventDefault();
    if (username.trim()) setSearching(true);
  }

  function cancelSearch() {
    setSearching(false);
    setMove(0);
  }

  return (
    <main className={`arena ${searching ? "searching" : ""}`}>
      <div className="full-board" aria-label="Animated chess arena">
        {Array.from({ length: 64 }, (_, index) => (
          <div className="square" key={index}>
            <span />
          </div>
        ))}

        <div className="pieces">
          {pieces.map((piece, index) => {
            const [row, col] = getSquare(piece, move, searching);
            const style = {
              "--row": row,
              "--col": col,
              "--delay": `${(index % 8) * -0.17}s`,
            } as CSSProperties;

            return (
              <span className={`chess-piece ${piece.side}`} key={piece.id} style={style}>
                <span className="piece-glyph">{piece.symbol}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="vignette" />
      <div className="grain" />

      <form className="control-panel" onSubmit={findOpponent}>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          maxLength={18}
          placeholder="TYPE USERNAME"
          aria-label="Username"
          autoComplete="off"
        />

        <div className="actions">
          <button className="find-button" type="submit" disabled={!username.trim() || searching}>
            {searching ? "FINDING OPPONENT" : "FIND OPPONENT"}
          </button>
          {searching && (
            <button className="cancel-button" type="button" onClick={cancelSearch}>
              CANCEL
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
