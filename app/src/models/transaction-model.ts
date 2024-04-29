import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  currency: String,
  date: Date,
});

const TransactionModel = mongoose.model('Transaction', transactionSchema);

export default TransactionModel;
