import React, { useRef, useEffect, useState } from "react";

const WIDTH = 600;
const HEIGHT = 200;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 60;
const BALL_SIZE = 12;
const PADDLE_SPEED = 5;
const BALL_SPEED = 3;

const PongGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [running, setRunning] = useState(true);

  // Estado del juego
  const gameState = useRef({
    leftY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    rightY: HEIGHT / 2 - PADDLE_HEIGHT / 2,
    ballX: WIDTH / 2 - BALL_SIZE / 2,
    ballY: HEIGHT / 2 - BALL_SIZE / 2,
    ballVX: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    ballVY: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
  });

  // Dibuja el juego
  const draw = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Fondo
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Paddles
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(0, gameState.current.leftY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#16a34a";
    ctx.fillRect(
      WIDTH - PADDLE_WIDTH,
      gameState.current.rightY,
      PADDLE_WIDTH,
      PADDLE_HEIGHT
    );
    // Pelota
    ctx.fillStyle = "#111827";
    ctx.fillRect(
      gameState.current.ballX,
      gameState.current.ballY,
      BALL_SIZE,
      BALL_SIZE
    );
    // Score
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#2563eb";
    ctx.fillText(score.left.toString(), WIDTH / 2 - 50, 40);
    ctx.fillStyle = "#16a34a";
    ctx.fillText(score.right.toString(), WIDTH / 2 + 30, 40);
  };

  // Lógica del juego
  const update = () => {
    const s = gameState.current;
    // Mover pelota
    s.ballX += s.ballVX;
    s.ballY += s.ballVY;

    // IA simple: el paddle derecho sigue la pelota
    const centerRight = s.rightY + PADDLE_HEIGHT / 2;
    if (centerRight < s.ballY) {
      s.rightY = Math.min(HEIGHT - PADDLE_HEIGHT, s.rightY + PADDLE_SPEED - 2);
    } else if (centerRight > s.ballY + BALL_SIZE) {
      s.rightY = Math.max(0, s.rightY - (PADDLE_SPEED - 2));
    }

    // Rebote arriba/abajo
    if (s.ballY <= 0 || s.ballY + BALL_SIZE >= HEIGHT) {
      s.ballVY *= -1;
    }
    // Rebote paddle izquierda
    if (
      s.ballX <= PADDLE_WIDTH &&
      s.ballY + BALL_SIZE >= s.leftY &&
      s.ballY <= s.leftY + PADDLE_HEIGHT
    ) {
      s.ballVX *= -1;
      s.ballX = PADDLE_WIDTH;
    }
    // Rebote paddle derecha
    if (
      s.ballX + BALL_SIZE >= WIDTH - PADDLE_WIDTH &&
      s.ballY + BALL_SIZE >= s.rightY &&
      s.ballY <= s.rightY + PADDLE_HEIGHT
    ) {
      s.ballVX *= -1;
      s.ballX = WIDTH - PADDLE_WIDTH - BALL_SIZE;
    }
    // Punto izquierda
    if (s.ballX + BALL_SIZE >= WIDTH) {
      setScore((sc) => {
        const newScore = { ...sc, left: sc.left + 1 };
        setTimeout(() => resetBall(-1), 100);
        return newScore;
      });
    }
    // Punto derecha
    if (s.ballX <= 0) {
      setScore((sc) => {
        const newScore = { ...sc, right: sc.right + 1 };
        setTimeout(() => resetBall(1), 100);
        return newScore;
      });
    }
  };

  // Resetear pelota
  const resetBall = (dir: number) => {
    gameState.current.ballX = WIDTH / 2 - BALL_SIZE / 2;
    gameState.current.ballY = HEIGHT / 2 - BALL_SIZE / 2;
    gameState.current.ballVX = BALL_SPEED * dir;
    gameState.current.ballVY = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  };

  // Loop principal
  useEffect(() => {
    if (!running) return;
    let animation: number;
    const loop = () => {
      update();
      draw();
      animation = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animation);
    // eslint-disable-next-line
  }, [running, score]);

  // Controles: paddle izquierdo con flechas
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const s = gameState.current;
      if (e.key === "ArrowUp") {
        s.leftY = Math.max(0, s.leftY - PADDLE_SPEED);
      }
      if (e.key === "ArrowDown") {
        s.leftY = Math.min(HEIGHT - PADDLE_HEIGHT, s.leftY + PADDLE_SPEED);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Reset
  const handleReset = () => {
    setScore({ left: 0, right: 0 });
    gameState.current.leftY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    gameState.current.rightY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    resetBall(Math.random() > 0.5 ? 1 : -1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto p-6 flex flex-col items-center">
      <h2 className="text-lg font-bold text-gray-800 mb-2">Mano a mano</h2>
      <p className="text-xs text-gray-500 mb-4">
        Jugador Izq: ↑/↓ &nbsp;|&nbsp; Jugador Der: ↑/↓
      </p>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          width: "100%",
          maxWidth: WIDTH,
          background: "#f3f4f6",
          borderRadius: 8,
        }}
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleReset}
      >
        Reiniciar
      </button>
    </div>
  );
};

export default PongGame;
