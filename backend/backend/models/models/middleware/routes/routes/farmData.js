import express from 'express';
import FarmData from '../models/FarmData.js';
import { protect } from '../middleware/auth.js';
import { dataValidation } from '../utils/dataCorrection.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all farm data with filtering
router.get('/', async (req, res) => {
  try {
    const { category, crop, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    let query = { userId: req.user.id };
    
    if (category) query.category = category;
    if (crop) query.crop = crop;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const data = await FarmData.find(query)
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await FarmData.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: data.length,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Add new farm data
router.post('/', async (req, res) => {
  try {
    const rawData = { ...req.body, userId: req.user.id };
    
    const validatedData = await dataValidation(rawData);
    
    const farmData = await FarmData.create(validatedData);
    
    res.status(201).json({
      status: 'success',
      data: farmData,
      health: {
        score: validatedData.dataHealth.score,
        issues: validatedData.dataHealth.issues
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get data health summary
router.get('/health', async (req, res) => {
  try {
    const totalRecords = await FarmData.countDocuments({ userId: req.user.id });
    const verifiedRecords = await FarmData.countDocuments({ 
      userId: req.user.id, 
      isVerified: true 
    });
    
    const averageHealth = await FarmData.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, avgHealth: { $avg: '$dataHealth.score' } } }
    ]);
    
    const avgScore = averageHealth[0]?.avgHealth || 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        averageHealthScore: Math.round(avgScore),
        totalRecords,
        verifiedRecords,
        verificationRate: totalRecords ? 
          Math.round((verifiedRecords / totalRecords) * 100) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;
