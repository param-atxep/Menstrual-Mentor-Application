import { Cycle } from '../lib/supabase';
import { Calendar, TrendingUp, Smile, Battery } from 'lucide-react';

interface CycleHistoryProps {
  cycles: Cycle[];
}

export default function CycleHistory({ cycles }: CycleHistoryProps) {
  if (cycles.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No cycle data yet</p>
        <p className="text-sm text-gray-500 mt-2">Start logging your cycles to see history</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      'Happy': '😊',
      'Neutral': '😐',
      'Sad': '😢',
      'Irritable': '😠',
      'Anxious': '😰',
    };
    return moodMap[mood] || '😐';
  };

  const getEnergyColor = (energy: string) => {
    const colorMap: { [key: string]: string } = {
      'High': 'text-green-600 bg-green-50',
      'Medium': 'text-yellow-600 bg-yellow-50',
      'Low': 'text-red-600 bg-red-50',
    };
    return colorMap[energy] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-4">
      {cycles.map((cycle) => (
        <div
          key={cycle.id}
          className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg hover:shadow-md transition"
        >
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{formatDate(cycle.date)}</p>
              <p className="text-sm text-gray-600">Day {cycle.cycle_length} of cycle</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="flex items-center space-x-1 mb-1">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600">Length</span>
              </div>
              <p className="font-semibold text-gray-800">{cycle.cycle_length}d</p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-1 mb-1">
                <Smile className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600">Mood</span>
              </div>
              <p className="text-2xl">{getMoodEmoji(cycle.mood)}</p>
            </div>

            <div className="text-center">
              <div className="flex items-center space-x-1 mb-1">
                <Battery className="w-4 h-4 text-gray-600" />
                <span className="text-xs text-gray-600">Energy</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEnergyColor(cycle.energy)}`}>
                {cycle.energy}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
