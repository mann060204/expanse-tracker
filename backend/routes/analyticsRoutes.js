const express = require('express');
const router = express.Router();
const {
  getSummary,
  getDailyExpenses,
  getMonthlyCategory,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/daily', protect, getDailyExpenses);
router.get('/monthly-category', protect, getMonthlyCategory);

module.exports = router;
