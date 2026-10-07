const Transaction = require('../models/Transaction');

// @desc    Get dashboard summary (KPIs)
// @route   GET /api/analytics/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const matchObj = req.user.orgId 
      ? { orgId: req.user.orgId } 
      : { userId: req.user.id, $or: [{ orgId: { $exists: false } }, { orgId: null }] };

    const transactions = await Transaction.find(matchObj);

    let totalCredit = 0;
    let totalDebit = 0;
    let totalInvestedRaw = 0;
    let totalMfWithdrawn = 0;
    let totalIciciStipend = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'credit') totalCredit += tx.amount;
      if (tx.type === 'debit') totalDebit += tx.amount;
      if (tx.type === 'mf_transfer') totalInvestedRaw += tx.amount;
      if (tx.type === 'mf_withdrawal') totalMfWithdrawn += tx.amount;
      if (tx.type === 'icici_stipend') totalIciciStipend += tx.amount;
    });

    const totalInvested = totalInvestedRaw - totalMfWithdrawn;
    const bankBalance = totalCredit - totalDebit - totalInvestedRaw + totalMfWithdrawn;

    res.json({
      bankBalance,
      totalCredit,
      totalDebit,
      totalInvested,
      totalIciciStipend,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get daily expenses for line chart
// @route   GET /api/analytics/daily
// @access  Private
const getDailyExpenses = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchObj = req.user.orgId 
      ? { orgId: req.user.orgId } 
      : { userId: req.user.id, $or: [{ orgId: { $exists: false } }, { orgId: null }] };

    const dailyData = await Transaction.aggregate([
      {
        $match: {
          ...matchObj,
          type: { $in: ['debit', 'credit'] },
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for frontend charting
    const formattedData = dailyData.map((item) => ({
      date: item._id,
      amount: item.expense,
      income: item.income,
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get monthly category breakdown
// @route   GET /api/analytics/monthly-category
// @access  Private
const getMonthlyCategory = async (req, res) => {
  try {
    const month = parseInt(req.query.month); // 1-12
    const year = parseInt(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ message: 'Please provide month and year' });
    }

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const matchObj = req.user.orgId 
      ? { orgId: req.user.orgId } 
      : { userId: req.user.id, $or: [{ orgId: { $exists: false } }, { orgId: null }] };

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          ...matchObj,
          type: 'debit',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const formattedData = categoryData.map((item) => ({
      name: item._id,
      value: item.total,
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get month-wise total expenses and income for a year
// @route   GET /api/analytics/monthly-totals
// @access  Private
const getMonthlyTotals = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    const matchObj = req.user.orgId
      ? { orgId: req.user.orgId }
      : { userId: req.user.id, $or: [{ orgId: { $exists: false } }, { orgId: null }] };

    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          ...matchObj,
          type: { $in: ['debit', 'credit'] },
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build full 12-month array, filling missing months with 0
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = monthNames.map((month, index) => {
      const found = monthlyData.find((d) => d._id === index + 1);
      const income = found ? found.income : 0;
      const expense = found ? found.expense : 0;
      return {
        month,
        expense,
        income,
        savings: Math.max(income - expense, 0), // only show positive savings
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getSummary,
  getDailyExpenses,
  getMonthlyCategory,
  getMonthlyTotals,
};
