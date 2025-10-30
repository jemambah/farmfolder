import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  TrendingUp, 
  DollarSign, 
  ClipboardList, 
  Lightbulb,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCost: 0,
    netProfit: 0,
    dataHealth: 0
  });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, healthRes] = await Promise.all([
        axios.get('/api/analytics/dashboard'),
        axios.get('/api/farm-data/health')
      ]);

      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.stats);
        setInsights(dashboardRes.data.insights);
      }

      if (healthRes.data.success) {
        setStats(prev => ({
          ...prev,
          dataHealth: healthRes.data.data.averageHealthScore
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setInsights([
        {
          type: 'info',
          message: 'Welcome to Farm Folder! Start by adding your farm data to get personalized insights.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '' }) => (
    <div className={`card border-l-4 ${color} animate-slide-up`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
            <Icon className={`h-6 w-6 ${color.replace('border-l-', 'text-').replace('-500', '-600')}`} />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  );

  const InsightCard = ({ insight, index }) => {
    const icons = {
      warning: AlertTriangle,
      success: CheckCircle2,
      info: Lightbulb,
      suggestion: Lightbulb
    };
    
    const colors = {
      warning: 'text-amber-600 bg-amber-50 border-amber-200',
      success: 'text-green-600 bg-green-50 border-green-200',
      info: 'text-blue-600 bg-blue-50 border-blue-200',
      suggestion: 'text-purple-600 bg-purple-50 border-purple-200'
    };
    
    const Icon = icons[insight.type] || Lightbulb;
    
    return (
      <div className={`flex items-start p-4 rounded-lg border ${colors[insight.type]} animate-fade-in`} 
           style={{ animationDelay: `${index * 100}ms` }}>
        <Icon className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium">{insight.message}</p>
          <span className="text-xs capitalize mt-1 block opacity-75">
            {insight.type} • Just now
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Welcome back, {user?.name}!</h1>
        <Link 
          to="/data" 
          className="btn-primary"
        >
          Add Farm Data
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={DollarSign}
          color="border-l-green-500"
          prefix="$"
        />
        <StatCard
          title="Total Cost"
          value={stats.totalCost}
          icon={ClipboardList}
          color="border-l-red-500"
          prefix="$"
        />
        <StatCard
          title="Net Profit"
          value={stats.netProfit}
          icon={TrendingUp}
          color="border-l-blue-500"
          prefix="$"
        />
        <StatCard
          title="Data Health"
          value={stats.dataHealth}
          icon={Lightbulb}
          color="border-l-yellow-500"
          suffix="%"
        />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Actionable Insights
        </h2>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <InsightCard key={index} insight={insight} index={index} />
            ))
          ) : (
            <p className="text-gray-500">No insights available. Add more data to get recommendations.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
