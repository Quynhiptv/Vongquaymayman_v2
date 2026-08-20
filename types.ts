export interface Participant {
  id: string;
  name: string;
  color: string;
}

export interface Winner {
  id: string;
  name: string;
  timestamp: string;
}

export interface AppState {
  participants: Participant[];
  winners: Winner[];
  isSpinning: boolean;
  secretMode: boolean; // Troll mode
  isMobilePreview: boolean; // For desktop view
}

export const WHEEL_COLORS = [
  '#EF4444', // Red-500
  '#3B82F6', // Blue-500
  '#10B981', // Emerald-500
  '#F59E0B', // Amber-500
  '#8B5CF6', // Violet-500
  '#EC4899', // Pink-500
  '#06B6D4', // Cyan-500
  '#84CC16', // Lime-500
];