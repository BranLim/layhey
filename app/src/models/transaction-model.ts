import mongoose from 'mongoose';

export const transactionSchema = new mongoose.Schema({
  category: String,
  amount: Number,
  currency: String,
  date: Date,
});
