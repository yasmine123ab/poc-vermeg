import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

interface Props {
  value: number;
  duration?: number;
  suffix?: string;
  decimals?: number;
}

const CountUp: React.FC<Props> = ({ value, duration = 1, suffix = '', decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const controls = animate(previousValue.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: v => setDisplay(v),
    });
    previousValue.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return <>{display.toFixed(decimals)}{suffix}</>;
};

export default CountUp;
