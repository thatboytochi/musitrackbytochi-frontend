import { useEffect, useState } from "react";

export default function FullScreenLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulates a smooth loading progression that eases up to ~90%
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-night">
      <div className="flex w-full max-w-[180px] flex-col items-center gap-8">
        <img
          src="/logo-full.png"
          alt="MusiTrack By Tochi"
          className="h-auto w-full animate-pulse opacity-90"
        />
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-snow transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}