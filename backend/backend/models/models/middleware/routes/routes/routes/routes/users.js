import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
router.patch('/profile', async (req, res) => {
  try {
    const { name, farmType, location, farmSize } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, farmType, location, farmSize },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
