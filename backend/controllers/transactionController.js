const Transaction = require('../models/Transaction');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const matchObj = req.user.orgId 
      ? { orgId: req.user.orgId } 
      : { userId: req.user.id, $or: [{ orgId: { $exists: false } }, { orgId: null }] };
      
    const transactions = await Transaction.find(matchObj).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, note, attachment_url } = req.body;

    if (!amount || !type || !category || !date) {
      return res.status(400).json({ message: 'Please provide amount, type, category, and date' });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      orgId: req.user.orgId || null,
      amount,
      type,
      category,
      date,
      note,
      attachment_url,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure the logged in user matches the transaction user or org
    if (req.user.orgId) {
      if (transaction.orgId !== req.user.orgId) {
        return res.status(401).json({ message: 'Not authorized for this organization' });
      }
    } else {
      if (transaction.userId !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
      }
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Make sure the logged in user matches the transaction user or org
    if (req.user.orgId) {
      if (transaction.orgId !== req.user.orgId) {
        return res.status(401).json({ message: 'Not authorized for this organization' });
      }
    } else {
      if (transaction.userId !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
      }
    }

    await transaction.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
