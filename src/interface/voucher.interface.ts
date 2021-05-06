import mongoose from "mongoose";

export interface IVoucher extends mongoose.Document {
  _id: string;
  user: string;
  voucherId: string;
  status: string;
  amount: number;
  created: Date;
  used?: boolean;
  expiredAt?: Date;
}
