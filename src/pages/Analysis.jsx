import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { TrendingUp, BarChart3, PieChart, DollarSign } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const [yieldData, setYieldData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [yieldRes, dashboardRes] = await Promise.all([
        axios.get('/api/analytics/yield'),
        axios.get('/api/analytics/dashboard')
      ]);

      if (yieldRes.data.success) {
        setYieldData(yieldRes.data.data);
      }

      if (dashboardRes.data.success) {
        setFinancialData(dashboardRes.data.stats);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, prefix = '', suffix = '' }) => (
    <div className={`card border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${color.replace('border-l-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border-l-', 'text-').replace('-500', '-600')}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">Farm Analytics</h1>
      </div>

      {/* Financial Overview */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-green-600" />
          Financial Overview
        </h2>
        {financialData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Revenue"
              value={financialData.totalRevenue}
              icon={TrendingUp}
              color="border-l-green-500"
              prefix="$"
            />
            <StatCard
              title="Total Cost"
              value={financialData.totalCost}
              icon={BarChart3}
              color="border-l-red-500"
              prefix="$"
            />
            <StatCard
              title="Net Profit"
              value={financialData.netProfit}
              icon={DollarSign}
              color="border-l-blue-500"
              prefix="$"
            />
          </div>
        ) : (
          <p className="text-gray-500">No financial data available.</p>
        )}
      </div>

      {/* Yield Analysis */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-green-600" />
          Yield Analysis
        </h2>
        {yieldData && yieldData.yieldCount > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Yield"
                value={yieldData.totalYield}
                icon={TrendingUp}
                color="border-l-yellow-500"
                suffix={` ${yieldData.byCrop ? Object.keys(yieldData.byCrop)[0] === 'maize' ? 'tons' : 'kg' : ''}`}
              />
              <StatCard
                title="Average Yield"
                value={yieldData.averageYield}
                icon={BarChart3}
                color="border-l-purple-500"
                suffix={` ${yieldData.byCrop ? Object.keys(yieldData.byCrop)[0] === 'maize' ? 'tons/ha' : 'kg/ha' : ''}`}
              />
              <StatCard
                title="Records"
                value={yieldData.yieldCount}
                icon={PieChart}
                color="border-l-indigo-500"
              />
            </div>

            {yieldData.byCrop && (
              <div>
                <h3 className="font-medium mb-3">Yield by Crop</h3>
                <div className="space-y-2">
                  {Object.entries(yieldData.byCrop).map(([crop, data]) => (
                    <div key={crop} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="capitalize font-medium">{crop}</span>
                      <div className="text-right">
                        <p className="font-semibold">
                          {data.total.toLocaleString()} {crop === 'maize' ? 'tons' : 'kg'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Avg: {(data.total / data.count).toFixed(1)} per harvest
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No yield data available. Start recording your harvests to see analytics.</p>
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Performance Insights</h2>
        <div className="space-y-3">
          {financialData && financialData.netProfit > 0 && (
            <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Positive Performance</p>
                <p className="text-green-700 text-sm">
                  Your farm is generating a profit of ${financialData.netProfit}. 
                  {financialData.netProfit > 1000 ? ' Consider reinvesting in expansion.' : ' Focus on maintaining this positive trend.'}
                </p>
              </div>
            </div>
          )}

          {financialData && financialData.netProfit < 0 && (
            <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <BarChart3 className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-800">Attention Needed</p>
                <p className="text-amber-700 text-sm">
                  Your farm is currently operating at a loss. Review your input costs and 
                  explore ways to increase revenue through better market prices or yield improvements.
                </p>
              </div>
            </div>
          )}

          {yieldData && yieldData.yieldCount === 0 && (
            <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <PieChart className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Start Tracking Yield</p>
                <p className="text-blue-700 text-sm">
                  Record your harvest data to get detailed yield analytics and 
                  compare your performance with regional benchmarks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
