import React, { useState } from 'react';
import { Participant, WHEEL_COLORS } from '../types';
import { Plus, Trash2, Users, FileText, X, AlertTriangle } from 'lucide-react';

const simpleId = () => Math.random().toString(36).substr(2, 9);

interface ControlsProps {
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  isSpinning: boolean;
}

const Controls: React.FC<ControlsProps> = ({ participants, setParticipants, isSpinning }) => {
  const [newName, setNewName] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const addParticipant = () => {
    if (!newName.trim()) return;
    const color = WHEEL_COLORS[participants.length % WHEEL_COLORS.length];
    setParticipants([...participants, { id: simpleId(), name: newName.trim(), color }]);
    setNewName('');
  };

  const handleBulkAdd = () => {
    const lines = bulkText.split('\n').filter(l => l.trim().length > 0);
    const newParticipants = lines.map((name, index) => ({
      id: simpleId() + index,
      name: name.trim(),
      color: WHEEL_COLORS[(participants.length + index) % WHEEL_COLORS.length]
    }));
    setParticipants([...participants, ...newParticipants]);
    setBulkText('');
    setShowBulk(false);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const confirmClearAll = () => {
    setParticipants([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="w-full space-y-4 px-4 pb-8">
      {/* Single Add Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
          placeholder="Nhập tên người chơi..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          disabled={isSpinning}
        />
        <button
          onClick={addParticipant}
          disabled={isSpinning || !newName.trim()}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold p-3 rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-2">
        <button
          onClick={() => setShowBulk(true)}
          disabled={isSpinning}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <FileText size={16} /> Nhập nhanh
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          disabled={isSpinning || participants.length === 0}
          className="flex items-center gap-2 bg-red-900/50 hover:bg-red-900/80 text-red-200 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} /> Xóa tất cả
        </button>
      </div>

      {/* List */}
      <div className="max-h-60 overflow-y-auto space-y-2">
        {participants.map((p, idx) => (
          <div key={p.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border-l-4" style={{ borderLeftColor: p.color }}>
            <span className="text-white font-medium truncate flex-1">{idx + 1}. {p.name}</span>
            <button
              onClick={() => removeParticipant(p.id)}
              disabled={isSpinning}
              className="text-gray-500 hover:text-red-400 p-1"
            >
              <X size={18} />
            </button>
          </div>
        ))}
        {participants.length === 0 && (
          <div className="text-center text-gray-500 py-4 flex flex-col items-center">
            <Users size={32} className="mb-2 opacity-50" />
            <p>Chưa có người chơi nào.</p>
          </div>
        )}
      </div>

      {/* Bulk Add Modal */}
      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-4">Nhập danh sách</h3>
            <p className="text-gray-400 text-sm mb-2">Mỗi tên một dòng:</p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              className="w-full h-40 bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-yellow-500 focus:outline-none mb-4"
              placeholder="Nguyen Van A&#10;Tran Van B&#10;Le Thi C"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulk(false)}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkAdd}
                className="flex-1 bg-yellow-500 text-black font-bold py-2 rounded-lg hover:bg-yellow-400"
              >
                Thêm ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-red-900/50 animate-in fade-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
               <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Xóa tất cả?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Bạn có chắc chắn muốn xóa toàn bộ {participants.length} người chơi khỏi danh sách không? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-medium hover:bg-gray-600 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmClearAll}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-500 transition-colors"
              >
                Xóa hết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;