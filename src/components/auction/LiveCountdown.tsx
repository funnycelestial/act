import { useState, useEffect } from "react";

interface LiveCountdownProps {
  targetTime: string;
  className?: string;
}

export const LiveCountdown = ({ targetTime, className = "" }: LiveCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 4, seconds: 37 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let newSeconds = prev.seconds - 1;
        let newMinutes = prev.minutes;

        if (newSeconds < 0) {
          newSeconds = 59;
          newMinutes = Math.max(0, newMinutes - 1);
        }

        const totalSeconds = newMinutes * 60 + newSeconds;
        setIsUrgent(totalSeconds < 60); // Flash when under 1 minute

        return { minutes: newMinutes, seconds: newSeconds };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className={`${className} ${isUrgent ? 'animate-countdown-flash' : ''}`}>
      <span className="text-terminal-green">
        Time Remaining: {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </span>
    </div>
  );
};