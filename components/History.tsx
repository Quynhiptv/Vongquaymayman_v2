import React from 'react';
import { Winner } from '../types';
import { History as HistoryIcon, Clock } from 'lucide-react';

interface HistoryProps {
  winners: Winner[];
}

const History: React.FC<HistoryProps> = ({ winners }) => {
  if (winners.length === 0) return null;

  return (
    <div className="w-full px-4 mt-4 pb-12">
      <div className="flex items-center gap-2 text-gray-400 mb-3 px-2">
        <HistoryIcon size={18} />
        <span className="font-semibold uppercase text-xs tracking-wider">Lịch sử trúng thưởng</span>
      </div>
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        {winners.slice().reverse().map((w, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 border-b border-gray-700 last:border-0">
             <div className="flex items-center gap-3">
               <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-xs font-bold">
                 {winners.length - idx}
               </span>
               <span className="text-gray-200 font-medium">{w.name}</span>
             </div>
             <div className="flex items-center gap-1 text-gray-500 text-xs">
               <Clock size={12} />
               {new Date(w.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
