import React, { useEffect } from 'react';
import { Participant } from '../types';
import { Share2, X, Trophy } from 'lucide-react';
import { playWinSound, speakWinnerName } from '../utils/audio';

// Declare canvas-confetti types roughly
declare global {
  interface Window {
    confetti: any;
  }
}

interface WinnerModalProps {
  winner: Participant | null;
  onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose }) => {
  useEffect(() => {
    if (winner) {
      playWinSound();
      
      // Delay speech slightly to let the win sound start first
      const speechTimer = setTimeout(() => {
        speakWinnerName(winner.name);
      }, 600);

      if (window.confetti) {
        // Fire confetti from left and right
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          window.confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#EF4444', '#F59E0B', '#10B981']
          });
          window.confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
             colors: ['#EF4444', '#F59E0B', '#10B981']
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }

      return () => clearTimeout(speechTimer);
    }
  }, [winner]);

  if (!winner) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Vòng Quay May Mắn',
        text: `Chúc mừng ${winner.name} đã trúng thưởng!`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`Người chiến thắng là: ${winner.name}`);
      alert('Đã copy kết quả vào clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-gray-800 rounded-3xl p-8 border-4 border-yellow-500 shadow-2xl animate-shake flex flex-col items-center text-center">
        
        {/* Confetti Background in Modal (CSS) */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
           <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
           <div className="absolute top-10 right-1/4 w-2 h-2 bg-blue-500 rounded-full animate-ping delay-75"></div>
        </div>

        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
           <Trophy size={40} className="text-yellow-600" />
        </div>

        <h2 className="text-gray-400 text-lg font-medium mb-1">CHÚC MỪNG</h2>
        <h1 className="text-3xl font-extrabold text-white mb-6 break-words w-full" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.3)' }}>
          {winner.name}
        </h1>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl font-bold bg-yellow-500 text-black hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
          >
             <Share2 size={18} /> Chia sẻ
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;