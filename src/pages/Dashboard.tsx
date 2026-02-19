import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Cycle } from '../lib/supabase';
import { Heart, LogOut, MessageSquare, Image as ImageIcon, Calendar, History, AlertCircle, Sparkles } from 'lucide-react';
import TextAnalysisModal from '../components/TextAnalysisModal';
import ImageAnalysisModal from '../components/ImageAnalysisModal';
import CycleLogModal from '../components/CycleLogModal';
import CycleHistory from '../components/CycleHistory';
import CycleAnalyzer from '../components/CycleAnalyzer';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showTextModal, setShowTextModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [cycleAnalysis, setCycleAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCycles();
  }, [user, navigate]);

  const fetchCycles = async () => {
    try {
      const { data, error } = await supabase
        .from('cycles')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setCycles(data || []);

      if (data && data.length > 0) {
        analyzeCycles(data);
      }
    } catch (error) {
      console.error('Error fetching cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCycles = (cyclesData: Cycle[]) => {
    if (cyclesData.length === 0) return;

    const recentCycles = cyclesData.slice(0, 5);
    const avgCycleLength = recentCycles.reduce((sum, c) => sum + c.cycle_length, 0) / recentCycles.length;
    const lowEnergyCount = recentCycles.filter(c => c.energy.toLowerCase() === 'low').length;

    let alerts = [];
    let phase = 'Follicular';

    if (avgCycleLength > 35) {
      alerts.push('Irregular cycle detected (>35 days)');
    } else if (avgCycleLength < 21) {
      alerts.push('Short cycle detected (<21 days)');
    }

    if (lowEnergyCount >= 3) {
      alerts.push('Persistent fatigue detected');
    }

    const lastCycle = cyclesData[0];
    const daysSinceLastCycle = Math.floor((Date.now() - new Date(lastCycle.date).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastCycle <= 5) {
      phase = 'Menstrual';
    } else if (daysSinceLastCycle <= 13) {
      phase = 'Follicular';
    } else if (daysSinceLastCycle <= 16) {
      phase = 'Ovulation';
    } else {
      phase = 'Luteal';
    }

    setCycleAnalysis({
      avgCycleLength: avgCycleLength.toFixed(1),
      phase,
      alerts,
      daysSinceLastCycle
    });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleCycleLogged = () => {
    fetchCycles();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Menstrual Mentor
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-pink-600 transition"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {profile?.name || 'User'}!
          </h1>
          <p className="text-gray-600">Track your health and get personalized insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setShowTextModal(true)}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Text Analysis</h3>
            <p className="text-sm text-gray-600">Describe your symptoms</p>
          </button>

          <button
            onClick={() => setShowImageModal(true)}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Image Analysis</h3>
            <p className="text-sm text-gray-600">Upload for analysis</p>
          </button>

          <button
            onClick={() => setShowCycleModal(true)}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Log Cycle</h3>
            <p className="text-sm text-gray-600">Track your cycle</p>
          </button>

          <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-1">AI Powered</h3>
            <p className="text-sm text-pink-100">Smart health insights</p>
          </div>
        </div>

        {cycleAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-800">Cycle Phase Prediction</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Phase</p>
                  <p className="text-2xl font-bold text-purple-600">{cycleAnalysis.phase}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Average Cycle Length</p>
                  <p className="text-2xl font-bold text-gray-800">{cycleAnalysis.avgCycleLength} days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Days Since Last Cycle</p>
                  <p className="text-2xl font-bold text-gray-800">{cycleAnalysis.daysSinceLastCycle} days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-800">Risk Alerts</h2>
              </div>
              {cycleAnalysis.alerts.length > 0 ? (
                <div className="space-y-3">
                  {cycleAnalysis.alerts.map((alert: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{alert}</p>
                    </div>
                  ))}
                  <p className="text-sm text-gray-600 mt-4">
                    Consider consulting with a healthcare provider if symptoms persist.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Heart className="w-8 h-8 text-green-600" fill="currentColor" />
                    </div>
                    <p className="text-gray-600">No alerts detected</p>
                    <p className="text-sm text-gray-500 mt-1">Keep tracking for better insights</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-6">
            <History className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Cycle History</h2>
          </div>
          <CycleHistory cycles={cycles} />
        </div>

        {cycles.length > 0 && (
          <div className="mt-6">
            <CycleAnalyzer cycles={cycles} />
          </div>
        )}
      </div>

      {showTextModal && (
        <TextAnalysisModal onClose={() => setShowTextModal(false)} />
      )}

      {showImageModal && (
        <ImageAnalysisModal onClose={() => setShowImageModal(false)} />
      )}

      {showCycleModal && (
        <CycleLogModal
          onClose={() => setShowCycleModal(false)}
          onSuccess={handleCycleLogged}
        />
      )}
    </div>
  );
}
