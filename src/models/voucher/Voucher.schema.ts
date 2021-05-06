import mongoose from "mongoose";

const voucherSchema: mongoose.Schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  voucherId: { type: String },
  status: { type: String, default: "Active" },
  amount: { type: Number },
  used: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
  expiredAt: { type: Date },
});

export { voucherSchema };
