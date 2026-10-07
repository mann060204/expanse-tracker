const express = require('express');
const router = express.Router();
const {
  getSummary,
  getDailyExpenses,
  getMonthlyCategory,
  getMonthlyTotals,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/daily', protect, getDailyExpenses);
router.get('/monthly-category', protect, getMonthlyCategory);
router.get('/monthly-totals', protect, getMonthlyTotals);

module.exports = router;
