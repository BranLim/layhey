import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  periodStart: String,
  periodEnd: String,
  description: String,
});
