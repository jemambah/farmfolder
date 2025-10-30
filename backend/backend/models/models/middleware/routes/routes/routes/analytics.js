import express from 'express';
import FarmData from '../models/FarmData.js';
import { protect } from '../middleware/auth.js';
import { calculateYieldAnalysis, calculateFinancials } from '../utils/dataCorrection.js';

const router = express.Router();

router.use(protect);

// Get dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const farmData = await FarmData.find({ userId })
      .sort({ date: -1 })
      .limit(100);
    
    const financials = calculateFinancials(farmData);
    const yieldStats = calculateYieldAnalysis(farmData);
    
    const insights = generateInsights(financials, yieldStats, farmData);
    
    res.json({
      success: true,
      stats: {
        totalRevenue: financials.totalRevenue,
        totalCost: financials.totalCost,
        netProfit: financials.netProfit,
        dataHealth: 85
      },
      insights
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard data'
    });
  }
});

// Get yield analysis
router.get('/yield', async (req, res) => {
  try {
    const { crop } = req.query;
    const userId = req.user.id;
    
    let query = { userId, category: 'harvest' };
    if (crop) query.crop = crop;
    
    const yieldData = await FarmData.find(query);
    const analysis = calculateYieldAnalysis(yieldData);
    
    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function generateInsights(financials, yieldStats, farmData) {
  const insights = [];
  
  if (financials.netProfit < 0) {
    insights.push({
      type: 'warning',
      message: 'Your farm is currently operating at a loss. Consider reviewing input costs and market prices.'
    });
  }
  
  if (financials.profitMargin > 0 && financials.profitMargin < 15) {
    insights.push({
      type: 'suggestion',
      message: `Your profit margin is ${financials.profitMargin}%. Explore ways to reduce costs or find better market prices.`
    });
  }
  
  if (yieldStats.yieldCount > 0) {
    insights.push({
      type: 'info',
      message: `You have recorded ${yieldStats.yieldCount} harvests with an average yield of ${yieldStats.averageYield} units.`
    });
  } else {
    insights.push({
      type: 'info',
      message: 'Start recording your harvest data to get yield analysis and recommendations.'
    });
  }
  
  if (farmData.length === 0) {
    insights.push({
      type: 'info',
      message: 'Welcome to Farm Folder! Add your farm data to get personalized insights and recommendations.'
    });
  }
  
  return insights;
}

export default router;
