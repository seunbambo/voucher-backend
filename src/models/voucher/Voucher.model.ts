import mongoose from "mongoose";

import { IVoucher } from "../../interface/voucher.interface";

import { voucherSchema } from "./Voucher.schema";

const voucherModel: mongoose.Model<IVoucher> = mongoose.model<IVoucher>(
  "Voucher",
  voucherSchema,
  "Voucher"
);
export { voucherModel as VoucherModel };
