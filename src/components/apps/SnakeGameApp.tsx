"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { useWindowStore } from "@/store/windowStore";

const GRID_SIZE = 20; // 20x20 grid
const SPEED = 120; // ms per tick

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Position = { x: number; y: number };

export const SnakeGameApp: React.FC = () => {
  const { theme } = useWindowStore();
  const isLight = theme === "light";

  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);

  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
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

  const directionRef = useRef<Direction>("UP");
  const nextDirectionRef = useRef<Direction>("UP");
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
    directionRef.current = "UP";
    nextDirectionRef.current = "UP";
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  const changeDirection = useCallback((newDir: Direction) => {
    const currentDir = directionRef.current;
    if (newDir === "UP" && currentDir !== "DOWN") nextDirectionRef.current = "UP";
    if (newDir === "DOWN" && currentDir !== "UP") nextDirectionRef.current = "DOWN";
    if (newDir === "LEFT" && currentDir !== "RIGHT") nextDirectionRef.current = "LEFT";
    if (newDir === "RIGHT" && currentDir !== "LEFT") nextDirectionRef.current = "RIGHT";
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isGameOver) return;
      if (["ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        changeDirection("UP");
      }
      if (["ArrowDown", "KeyS"].includes(e.code)) {
        e.preventDefault();
        changeDirection("DOWN");
      }
      if (["ArrowLeft", "KeyA"].includes(e.code)) {
        e.preventDefault();
        changeDirection("LEFT");
      }
      if (["ArrowRight", "KeyD"].includes(e.code)) {
        e.preventDefault();
        changeDirection("RIGHT");
      }
      if (e.code === "Space") {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver, changeDirection]);

  // Main Game Loop
  useEffect(() => {
    if (!isPlaying || isGameOver) return;

    const timer = setInterval(() => {
      directionRef.current = nextDirectionRef.current;
      const dir = directionRef.current;

      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };

        if (dir === "UP") head.y -= 1;
        if (dir === "DOWN") head.y += 1;
        if (dir === "LEFT") head.x -= 1;
        if (dir === "RIGHT") head.x += 1;

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

        // Food eaten check
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => {
            const nextScore = prev + 10;
            if (nextScore > highScore) {
              setHighScore(nextScore);
              try {
                localStorage.setItem("son-os-snake-highscore", nextScore.toString());
              } catch {}
            }
            return nextScore;
          });

          setFood(generateFood(newSnake));
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
    }, SPEED);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, food, highScore, generateFood]);

  return (
    <div className={`flex flex-col h-full select-none p-4 items-center justify-between font-mono transition-colors ${
      isLight ? "bg-slate-100 text-slate-900" : "bg-zinc-950 text-zinc-100"
    }`}>
      {/* Top Header & Score Dashboard */}
      <div className={`w-full flex items-center justify-between border-b pb-3 gap-2 shrink-0 ${
        isLight ? "border-slate-200" : "border-white/10"
      }`}>
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
          <span>🎮 Snake Game</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Trophy size={15} />
            <span>High: {highScore}</span>
          </div>

          <div className={`px-3 py-1 rounded-xl font-bold transition-colors ${
            isLight ? "bg-white border border-slate-300 text-slate-900 shadow-xs" : "bg-white/10 text-white"
          }`}>
            Skor: {score}
          </div>
        </div>
      </div>

      {/* Game Board Container */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-85 aspect-square rounded-2xl overflow-hidden my-auto shadow-2xl flex items-center justify-center border ${
          isLight ? "bg-zinc-950 border-slate-300 shadow-slate-300/60" : "bg-zinc-900 border-white/15 shadow-black/60"
        }`}
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
                className={`rounded-xs ${
                  isHead
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
      <div className={`w-full flex items-center justify-between pt-2 border-t shrink-0 ${
        isLight ? "border-slate-200" : "border-white/10"
      }`}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={isGameOver}
          className={`p-2.5 rounded-xl disabled:opacity-30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
            isLight
              ? "bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs"
              : "bg-white/10 hover:bg-white/15 text-zinc-200"
          }`}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? "Jeda" : "Lanjut"}</span>
        </button>

        {/* Touch D-Pad Controls */}
        <div className="grid grid-cols-3 gap-1.5 w-36">
          <div />
          <button
            onClick={() => changeDirection("UP")}
            aria-label="Panah Atas"
            className={`p-2.5 rounded-xl active:bg-emerald-600 flex items-center justify-center min-h-10 cursor-pointer transition-colors ${
              isLight
                ? "bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <ArrowUp size={18} />
          </button>
          <div />

          <button
            onClick={() => changeDirection("LEFT")}
            aria-label="Panah Kiri"
            className={`p-2.5 rounded-xl active:bg-emerald-600 flex items-center justify-center min-h-10 cursor-pointer transition-colors ${
              isLight
                ? "bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={() => changeDirection("DOWN")}
            aria-label="Panah Bawah"
            className={`p-2.5 rounded-xl active:bg-emerald-600 flex items-center justify-center min-h-10 cursor-pointer transition-colors ${
              isLight
                ? "bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <ArrowDown size={18} />
          </button>
          <button
            onClick={() => changeDirection("RIGHT")}
            aria-label="Panah Kanan"
            className={`p-2.5 rounded-xl active:bg-emerald-600 flex items-center justify-center min-h-10 cursor-pointer transition-colors ${
              isLight
                ? "bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs"
                : "bg-white/10 hover:bg-white/20 text-white"
            }`}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
