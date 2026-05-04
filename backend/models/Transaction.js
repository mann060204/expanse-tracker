const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  orgId: {
    type: String,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'mf_transfer', 'mf_withdrawal'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  note: {
    type: String,
  },
  attachment_url: {
    type: String, // Cloudinary/S3 URL
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
