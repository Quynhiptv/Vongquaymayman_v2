import React, { useEffect, useState } from 'react';
import { Participant } from '../types';
import { playTickSound } from '../utils/audio';

interface WheelProps {
  participants: Participant[];
  isSpinning: boolean;
  winnerIndex: number | null; // The target index to land on
  onSpinComplete: () => void;
}

const Wheel: React.FC<WheelProps> = ({ participants, isSpinning, winnerIndex, onSpinComplete }) => {
  const [rotation, setRotation] = useState(0);
  
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 10; // Padding

  // Generate SVG path for a slice
  const getSlicePath = (index: number, total: number) => {
    const startAngle = (index * 360) / total;
    const endAngle = ((index + 1) * 360) / total;

    // Convert to radians, subtract 90deg to start at top (12 o'clock)
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // Large arc flag
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Handle Spinning Logic
  useEffect(() => {
    if (isSpinning && winnerIndex !== null && participants.length > 0) {
      const sliceSize = 360 / participants.length;
      
      // Calculate the angle where the center of the winner slice is currently located (relative to 0/Top)
      // Index 0 starts at 0deg (Top) and goes clockwise. Center is at sliceSize/2.
      const winnerCenterAngle = (winnerIndex * sliceSize) + (sliceSize / 2);
      
      // Add randomness within the slice (+/- 30% of slice width) to avoid border ambiguity
      // Reduced from 0.8 to 0.6 to keep it safely away from edges
      const randomOffset = (Math.random() - 0.5) * (sliceSize * 0.6);
      
      // The exact angle on the wheel we want to align with the pointer (Top/0deg)
      const targetAngleOnWheel = winnerCenterAngle + randomOffset;
      
      // We want: (currentRotation + delta) % 360  === (360 - targetAngleOnWheel) % 360
      // Because rotating clockwise brings the target (which is at X deg) to 0 deg by adding (360 - X)
      
      const currentRotationMod = rotation % 360;
      const targetRotationMod = (360 - targetAngleOnWheel) % 360; // Normalize to 0-360
      
      let distance = targetRotationMod - currentRotationMod;
      
      // Ensure we always rotate FORWARD (clockwise)
      if (distance < 0) {
        distance += 360;
      }
      
      // Add minimum spins (e.g., 10 full spins)
      const extraSpins = 360 * 10; 
      
      const newRotation = rotation + extraSpins + distance;
      
      setRotation(newRotation);
    }
  }, [isSpinning, winnerIndex, participants.length]);

  // Audio Ticking Effect during spin
  useEffect(() => {
    if (!isSpinning) return;

    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 9000; // 9s matches CSS
    
    // Check CSS transition completion usually, but we simulate ticks here
    const simulateTicks = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (progress < 1) {
            // Decelerating tick probability
            // Using a cubic ease-out feel for the probability of a tick happening
            const invProgress = 1 - progress; // 1 -> 0
            const chance = Math.max(0.01, invProgress * invProgress * 0.6); 
            
            if (Math.random() < chance) { 
                playTickSound();
            }
            animationFrameId = requestAnimationFrame(simulateTicks);
        } else {
            // Ensure we trigger complete exactly when animation matches
            // We set a small timeout to match CSS timing safety
            setTimeout(() => {
                onSpinComplete();
            }, 100);
        }
    };
    
    animationFrameId = requestAnimationFrame(simulateTicks);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isSpinning, onSpinComplete]);

  return (
    <div className="relative flex items-center justify-center py-8">
      {/* Outer Glow/Ring */}
      <div className="absolute w-[320px] h-[320px] rounded-full bg-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.6)] border-4 border-yellow-300 flex items-center justify-center">
        {/* LED Lights */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full bg-white ${isSpinning ? 'led-active' : ''}`}
            style={{
              top: '50%',
              left: '50%',
              transform: `rotate(${i * 30}deg) translate(154px) rotate(-${i * 30}deg)`,
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>

      {/* The Wheel */}
      <div 
        className="relative z-10 w-[300px] h-[300px]"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning ? 'transform 9s cubic-bezier(0.25, 1, 0.5, 1)' : 'none'
        }}
      >
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full drop-shadow-xl">
           {participants.length === 0 && (
             <circle cx={center} cy={center} r={radius} fill="#374151" />
           )}
           {participants.map((p, i) => (
             <g key={p.id}>
               <path d={getSlicePath(i, participants.length)} fill={p.color} stroke="#1F2937" strokeWidth="2" />
               <text
                 x={center + radius * 0.65 * Math.cos(((i * 360) / participants.length + 180 / participants.length - 90) * Math.PI / 180)}
                 y={center + radius * 0.65 * Math.sin(((i * 360) / participants.length + 180 / participants.length - 90) * Math.PI / 180)}
                 fill="white"
                 fontSize="12"
                 fontWeight="bold"
                 textAnchor="middle"
                 dominantBaseline="middle"
                 transform={`rotate(${(i * 360) / participants.length + 180 / participants.length}, ${center + radius * 0.65 * Math.cos(((i * 360) / participants.length + 180 / participants.length - 90) * Math.PI / 180)}, ${center + radius * 0.65 * Math.sin(((i * 360) / participants.length + 180 / participants.length - 90) * Math.PI / 180)})`}
                 style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
               >
                 {p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name}
               </text>
             </g>
           ))}
        </svg>
      </div>

      {/* Pointer/Needle */}
      <div className="absolute top-0 z-20 -mt-2 drop-shadow-lg">
         <svg width="40" height="50" viewBox="0 0 40 50">
           <path d="M20 50 L0 0 L40 0 Z" fill="#DC2626" stroke="#fff" strokeWidth="2" />
           <circle cx="20" cy="10" r="5" fill="#fff" />
         </svg>
      </div>
      
      {/* Center Cap */}
      <div className="absolute z-20 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-200">
         <span className="text-2xl">🎰</span>
      </div>
    </div>
  );
};

export default Wheel;