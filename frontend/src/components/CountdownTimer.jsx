import { useState, useEffect } from 'react';

export default function CountdownTimer({ seconds, onComplete }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(timer); 
  }, [remaining, onComplete]);

  return <p>Try again in {remaining}s...</p>;
}