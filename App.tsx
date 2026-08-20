import React, { useState, useEffect } from 'react';
import { Participant, Winner } from './types';
import Wheel from './components/Wheel';
import Controls from './components/Controls';
import WinnerModal from './components/WinnerModal';
import History from './components/History';
import { playStartSpinSound, playStopSpinSound } from './utils/audio';
import { Smartphone, Monitor } from 'lucide-react';

const STORAGE_KEY = 'lucky-spin-v1';

const App: React.FC = () => {
  // State
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [turnsSinceIndex1Won, setTurnsSinceIndex1Won] = useState(10); // Default to 10 to allow first win
  
  // Desktop Preview Mode
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.participants) setParticipants(parsed.participants);
        if (parsed.winners) setWinners(parsed.winners);
        if (typeof parsed.turnsSinceIndex1Won === 'number') setTurnsSinceIndex1Won(parsed.turnsSinceIndex1Won);
      } catch (e) { console.error('Load failed', e); }
    }
    
    const checkResize = () => setIsDesktop(window.innerWidth >= 768);
    checkResize();
    window.addEventListener('resize', checkResize);
    return () => window.removeEventListener('resize', checkResize);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ participants, winners, turnsSinceIndex1Won }));
  }, [participants, winners, turnsSinceIndex1Won]);

  const handleSpin = () => {
    if (participants.length < 2 || isSpinning) return;

    playStartSpinSound();
    setIsSpinning(true);
    setCurrentWinner(null);

    // LOGIC: Weighted selection with Cooldown for index 1
    const PRANK_INDEX = 1;
    const COOLDOWN_TURNS = 10; // Cần 10 lượt sau mới được trúng lại
    const NORMAL_WEIGHT = 10;
    const PRANK_WEIGHT = 2; // Tỉ lệ trúng thấp hơn 5 lần (2:10)
    
    const pool: number[] = [];

    participants.forEach((_, i) => {
      if (i === PRANK_INDEX) {
        // Chỉ thêm vào pool nếu đã qua thời gian hồi chiêu
        if (turnsSinceIndex1Won >= COOLDOWN_TURNS) {
          for (let j = 0; j < PRANK_WEIGHT; j++) pool.push(i);
        }
      } else {
        for (let j = 0; j < NORMAL_WEIGHT; j++) pool.push(i);
      }
    });

    // Safety fallback: if pool is empty for some reason, use all participants
    const finalPool = pool.length > 0 ? pool : participants.map((_, i) => i);
    const randomIndex = finalPool[Math.floor(Math.random() * finalPool.length)];
    
    setWinnerIndex(randomIndex);
  };

  const handleSpinComplete = () => {
    playStopSpinSound();
    setIsSpinning(false);
    if (winnerIndex !== null) {
      const winner = participants[winnerIndex];
      setCurrentWinner(winner);
      
      // Cập nhật số lượt hồi chiêu
      if (winnerIndex === 1) {
        setTurnsSinceIndex1Won(0); // Reset cooldown nếu người thứ 2 trúng
      } else {
        setTurnsSinceIndex1Won(prev => prev + 1); // Tăng lượt đếm nếu người khác trúng
      }

      setWinners(prev => [...prev, {
        id: Date.now().toString(),
        name: winner.name,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // The main mobile layout content
  const MobileContent = (
    <div className="flex flex-col h-full bg-gray-900 text-white overflow-y-auto">
      {/* Header */}
      <header className="flex-none p-6 text-center">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 uppercase tracking-widest select-none">
          Lucky Spin
        </h1>
        <p className="text-gray-500 text-xs mt-1 tracking-widest uppercase">Vòng quay vô cực</p>
      </header>

      {/* Wheel Area */}
      <div className="flex-none mb-4">
        <Wheel 
          participants={participants}
          isSpinning={isSpinning}
          winnerIndex={winnerIndex}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Spin Button */}
      <div className="flex-none px-8 mb-6">
        <button
          onClick={handleSpin}
          disabled={isSpinning || participants.length < 2}
          className={`w-full py-4 rounded-2xl text-xl font-bold uppercase tracking-wide shadow-lg transform transition-all active:scale-95 ${
            isSpinning || participants.length < 2
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:shadow-yellow-500/20'
          }`}
        >
          {isSpinning ? 'Đang quay...' : 'QUAY NGAY'}
        </button>
      </div>

      {/* Controls & List */}
      <div className="flex-1 bg-gray-800/30 rounded-t-3xl border-t border-gray-700 pt-6">
        <Controls 
          participants={participants} 
          setParticipants={setParticipants} 
          isSpinning={isSpinning} 
        />
        <History winners={winners} />
      </div>

      {/* Modals */}
      <WinnerModal winner={currentWinner} onClose={() => setCurrentWinner(null)} />
    </div>
  );

  // Desktop Wrapper
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8 relative">
        <div className="absolute top-4 right-4 flex gap-2">
            <button 
                onClick={() => setIsMobilePreview(!isMobilePreview)}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
                {isMobilePreview ? <Monitor size={16} /> : <Smartphone size={16} />}
                {isMobilePreview ? 'Full View' : 'Mobile Preview'}
            </button>
        </div>
        
        {isMobilePreview ? (
            <div className="relative w-[400px] h-[800px] bg-black rounded-[3rem] border-8 border-gray-800 shadow-2xl overflow-hidden ring-4 ring-gray-900">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-50"></div>
                {MobileContent}
            </div>
        ) : (
            <div className="w-full max-w-lg mx-auto bg-gray-900 min-h-[600px] rounded-xl shadow-2xl border border-gray-800 overflow-hidden">
                {MobileContent}
            </div>
        )}
        
        <div className="mt-8 text-gray-500 text-sm">
            Designed for Mobile • Built with React & Tailwind
        </div>
      </div>
    );
  }

  return MobileContent;
};

export default App;