import { Cycle } from '../lib/supabase';
import { BarChart, TrendingUp, AlertTriangle } from 'lucide-react';

interface CycleAnalyzerProps {
  cycles: Cycle[];
}

export default function CycleAnalyzer({ cycles }: CycleAnalyzerProps) {
  if (cycles.length < 3) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <BarChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Need at least 3 cycles for detailed analysis</p>
          <p className="text-sm text-gray-500 mt-2">
            Keep logging to unlock insights
          </p>
        </div>
      </div>
    );
  }

  const avgCycleLength = cycles.reduce((sum, c) => sum + c.cycle_length, 0) / cycles.length;
  const minCycle = Math.min(...cycles.map(c => c.cycle_length));
  const maxCycle = Math.max(...cycles.map(c => c.cycle_length));

  const moodCounts: { [key: string]: number } = {};
  const energyCounts: { [key: string]: number } = {};

  cycles.forEach(cycle => {
    moodCounts[cycle.mood] = (moodCounts[cycle.mood] || 0) + 1;
    energyCounts[cycle.energy] = (energyCounts[cycle.energy] || 0) + 1;
  });

  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
  const mostCommonEnergy = Object.entries(energyCounts).sort((a, b) => b[1] - a[1])[0][0];

  const irregularityScore = maxCycle - minCycle;
  const isIrregular = irregularityScore > 7;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <BarChart className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Detailed Analysis</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Average Cycle</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{avgCycleLength.toFixed(1)} days</p>
          <p className="text-sm text-blue-700 mt-1">Range: {minCycle}-{maxCycle} days</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">Common Mood</h3>
          <p className="text-2xl font-bold text-purple-600">{mostCommonMood}</p>
          <p className="text-sm text-purple-700 mt-1">
            {moodCounts[mostCommonMood]} out of {cycles.length} cycles
          </p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
          <h3 className="font-semibold text-pink-900 mb-2">Typical Energy</h3>
          <p className="text-2xl font-bold text-pink-600">{mostCommonEnergy}</p>
          <p className="text-sm text-pink-700 mt-1">
            {energyCounts[mostCommonEnergy]} out of {cycles.length} cycles
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <span>Pattern Analysis</span>
        </h3>

        <div className="space-y-3">
          {isIrregular ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-900">
                <strong>Irregular Cycles Detected:</strong> Your cycle length varies by {irregularityScore} days.
                This is common but worth discussing with a healthcare provider if persistent.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Regular Cycles:</strong> Your cycle length is relatively consistent.
                This is a good sign of hormonal balance.
              </p>
            </div>
          )}

          {energyCounts['Low'] >= cycles.length / 2 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>Low Energy Pattern:</strong> You frequently report low energy.
                Consider improving sleep, nutrition, and stress management.
              </p>
            </div>
          )}

          {(moodCounts['Sad'] || 0) + (moodCounts['Anxious'] || 0) >= cycles.length / 2 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Mood Pattern:</strong> You often experience mood changes.
                This can be related to hormonal fluctuations. Consider tracking triggers and self-care practices.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>• Continue tracking your cycles to identify long-term patterns</li>
            <li>• Maintain a balanced diet rich in iron and vitamins</li>
            <li>• Stay hydrated and get adequate sleep</li>
            <li>• Manage stress through relaxation techniques</li>
            <li>• Consult a healthcare provider if you notice concerning changes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
