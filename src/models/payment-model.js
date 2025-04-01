const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' }, // Store currency
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed'], 
        default: 'pending' 
    },
    paymentMethod: { type: String, enum: ['paystack', 'flutterwave'], required: true }, // Track method
    transactionId: { type: String, unique: true, required: true },
}, { timestamps: true });
  
  module.exports = mongoose.model('Payment', paymentSchema);