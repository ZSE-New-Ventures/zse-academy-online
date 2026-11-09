import React, { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per tick
  chunkSize?: number; // characters per tick
  onComplete?: () => void;
  className?: string;
  allowSkip?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 12,
  chunkSize = 3,
  onComplete,
  className = "",
  allowSkip = true,
}) => {
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDisplayedLength(0);
    setIsFinished(false);

    if (!text) {
      setIsFinished(true);
      return;
    }

    let current = 0;
    const total = text.length;

    timerRef.current = setInterval(() => {
      current = Math.min(current + chunkSize, total);
      setDisplayedLength(current);

      if (current >= total) {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed, chunkSize]);

  const handleSkip = () => {
    if (isFinished) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedLength(text.length);
    setIsFinished(true);
    if (onComplete) onComplete();
  };

  return (
    <div
      className={allowSkip && !isFinished ? "cursor-pointer group relative" : ""}
      onClick={allowSkip && !isFinished ? handleSkip : undefined}
      title={allowSkip && !isFinished ? "Click to show full text" : undefined}
    >
      <span className={className}>
        {text.slice(0, displayedLength)}
        {!isFinished && (
          <span className="inline-block w-2 h-3.5 ml-1 bg-[#00aeef] animate-pulse align-middle rounded-xs shadow-sm" />
        )}
      </span>
      {allowSkip && !isFinished && displayedLength > 30 && (
        <span className="block text-[10px] text-slate-400 group-hover:text-[#00aeef] mt-1.5 transition-colors font-medium select-none">
          Click text to show all
        </span>
      )}
    </div>
  );
};

