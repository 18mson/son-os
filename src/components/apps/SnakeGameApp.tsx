"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

const GRID_SIZE = 20; // 20x20 grid
const SPEED = 120; // ms per tick

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export const SnakeGameApp: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);

  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("UP");
  const [nextDirection, setNextDirection] = useState<Direction>("UP");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedHighScore = localStorage.getItem("son-os-snake-highscore");
      if (savedHighScore) return parseInt(savedHighScore, 10);
    }
    return 0;
  });
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on snake body
      const collides = currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
      if (!collides) break;
    }
    return newFood;
  }, []);

  const startGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection("UP");
    setNextDirection("UP");
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const changeDirection = useCallback(
    (newDir: Direction) => {
      if (newDir === "UP" && direction !== "DOWN") setNextDirection("UP");
      if (newDir === "DOWN" && direction !== "UP") setNextDirection("DOWN");
      if (newDir === "LEFT" && direction !== "RIGHT") setNextDirection("LEFT");
      if (newDir === "RIGHT" && direction !== "LEFT") setNextDirection("RIGHT");
    },
    [direction]
  );

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") changeDirection("UP");
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") changeDirection("DOWN");
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") changeDirection("LEFT");
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") changeDirection("RIGHT");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, changeDirection]);

  // Main Game Loop Tick
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      setDirection(nextDirection);

      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        switch (nextDirection) {
          case "UP":
            head.y -= 1;
            break;
          case "DOWN":
            head.y += 1;
            break;
          case "LEFT":
            head.x -= 1;
            break;
          case "RIGHT":
            head.x += 1;
            break;
        }

        // Wall collision check
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setIsGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        // Self collision check
        if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setIsGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Food collision check
        if (head.x === food.x && head.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);

          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("son-os-snake-highscore", newScore.toString());
          }

          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    }, SPEED);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, nextDirection, food, score, highScore, generateFood]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none p-4 items-center justify-between font-mono">
      {/* Top Header & Score Dashboard */}
      <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 gap-2 shrink-0">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
          <span>🎮 Snake Game</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Trophy size={15} />
            <span>High: {highScore}</span>
          </div>

          <div className="bg-white/10 px-3 py-1 rounded-xl text-white font-bold">
            Skor: {score}
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div
        ref={containerRef}
        className="relative w-full max-w-85 aspect-square bg-zinc-900 border border-white/15 rounded-2xl overflow-hidden my-auto shadow-2xl flex items-center justify-center"
      >
        {/* Grid cells matrix */}
        <div className="grid grid-cols-20 grid-rows-20 w-full h-full p-1 gap-0.5">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
            const x = idx % GRID_SIZE;
            const y = Math.floor(idx / GRID_SIZE);

            const isHead = snake[0].x === x && snake[0].y === y;
            const isBody = snake.slice(1).some((s) => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={idx}
                className={`rounded-xs transition-colors ${isHead
                    ? "bg-emerald-400 shadow-md shadow-emerald-400/50 scale-105 z-10"
                    : isBody
                      ? "bg-emerald-600/80"
                      : isFood
                        ? "bg-rose-500 rounded-full animate-pulse scale-90 shadow-md shadow-rose-500/50"
                        : "bg-white/2"
                  }`}
              />
            );
          })}
        </div>

        {/* Start / Game Over Overlay */}
        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20 space-y-4">
            {isGameOver ? (
              <>
                <h3 className="text-xl font-bold text-rose-400">GAME OVER!</h3>
                <p className="text-xs text-zinc-300">Skor Akhir Anda: <span className="text-emerald-400 font-bold">{score}</span></p>
                <button
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <RotateCcw size={16} /> Main Lagi
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-emerald-400">Snake Classic Easter Egg</h3>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Gunakan tombol panah atau WASD untuk mengendalikan ular. Makan buah merah untuk menambah skor!
                </p>
                <button
                  onClick={startGame}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <Play size={16} /> Mulai Permainan
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* On-Screen Mobile & Touch D-Pad Controls */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-white/10 shrink-0">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isGameOver}
          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 disabled:opacity-30 text-xs font-semibold flex items-center gap-1.5"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? "Jeda" : "Lanjut"}</span>
        </button>

        {/* D-Pad */}
        <div className="grid grid-cols-3 gap-1 w-32">
          <div />
          <button
            onClick={() => changeDirection("UP")}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-emerald-600 text-white flex items-center justify-center"
          >
            <ArrowUp size={16} />
          </button>
          <div />

          <button
            onClick={() => changeDirection("LEFT")}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-emerald-600 text-white flex items-center justify-center"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => changeDirection("DOWN")}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-emerald-600 text-white flex items-center justify-center"
          >
            <ArrowDown size={16} />
          </button>
          <button
            onClick={() => changeDirection("RIGHT")}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-emerald-600 text-white flex items-center justify-center"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
