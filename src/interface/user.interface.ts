import mongoose from "mongoose";
import { IVoucher } from "./voucher.interface";

export interface IUser extends mongoose.Document {
  username: string;
  password: string;
  balance: number;
  role?: string;
  date?: Date;
  vouchers?: [{ voucher: IVoucher | string }];

  comparePassword(password: string): Promise<boolean>;
}
