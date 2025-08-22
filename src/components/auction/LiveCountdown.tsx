import { useState, useEffect } from "react";

interface LiveCountdownProps {
  endTime: string;
  className?: string;
}

export const LiveCountdown = ({ endTime, className = "" }: LiveCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setIsUrgent(difference < 60000); // Flash when under 1 minute
        return { hours, minutes, seconds };
      }
      
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  const formatDisplay = () => {
    if (timeLeft.hours > 0) {
      return `${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;
    }
    return `${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;
  };

  return (
    <div className={`${className} ${isUrgent ? 'animate-countdown-flash' : ''}`}>
      <span className="text-terminal-green">
        Time Remaining: {formatDisplay()}
      </span>
    </div>
  );
};