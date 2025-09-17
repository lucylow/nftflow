import React, { useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useHover } from '@use-gesture/react';

interface AnimatedCardProps {
  children: React.ReactNode;
  depth?: number;
  tilt?: number;
  className?: string;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  depth = 10, 
  tilt = 5, 
  className = '' 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [styles, api] = useSpring(() => ({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    config: { mass: 1, tension: 350, friction: 40 },
  }));

  useHover(
    ({ hovering, xy: [x, y] }) => {
      if (hovering && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const relativeX = x - rect.left;
        const relativeY = y - rect.top;
        
        const rotateY = ((relativeX - rect.width / 2) / rect.width) * tilt;
        const rotateX = ((relativeY - rect.height / 2) / rect.height) * -tilt;
        const scale = 1.05;
        
        api.start({ rotateX, rotateY, scale });
      } else {
        api.start({ rotateX: 0, rotateY: 0, scale: 1 });
      }
    },
    { target: cardRef }
  );

  return (
    <animated.div
      ref={cardRef}
      className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${className}`}
      style={{
        transform: styles.rotateX.to(
          (rx, ry, s) => `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
        ),
        boxShadow: styles.rotateY.to(
          (ry, rx) => `
            ${ry * 0.5}px ${rx * 0.5}px 20px rgba(0, 0, 0, 0.1),
            ${ry * 0.25}px ${rx * 0.25}px 10px rgba(0, 0, 0, 0.05)
          `
        ),
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </animated.div>
  );
};

export default AnimatedCard;
