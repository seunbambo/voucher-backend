import Joi from "@hapi/joi";
import { Context } from "koa";

import { IVoucher } from "../../interface/voucher.interface";
import { VoucherModel } from "../../models/voucher/Voucher.model";
import { UserModel } from "../../models/user/User.model";
// import { IUser } from "../../interface/user.interface";

const RANDOM_VALUE_MULTIPLIER = 10001;

export class Voucher {
  public async getAllVouchers(ctx: Context): Promise<void> {
    try {
      const vouchers = await VoucherModel.find({}).sort({ created: -1 });
      ctx.body = { message: "All vouchers", vouchers };
    } catch (error) {
      console.log(error);
      ctx.body = error;
    }
  }

  public async addVoucher(ctx: Context): Promise<void> {
    try {
      const body: IVoucher = ctx.request.body;
      const schema = Joi.object().keys({
        amount: Joi.number().required(),
      });
      const value: IVoucher = await schema.validateAsync(body);
      const { id } = ctx.state.user;

      value.user = id;
      value.voucherId = `${Math.floor(Math.random() * RANDOM_VALUE_MULTIPLIER)}`;
      const voucher = await VoucherModel.create(value);
      if (voucher) {
        await UserModel.updateOne(
          {
            _id: id,
          },
          {
            $push: {
              vouchers: {
                voucher: voucher._id,
              },
            },
          }
        );
        ctx.body = { message: "Voucher added successfully", voucher };
      }
      ctx.body = { message: "Voucher added successfully", voucher };
    } catch (error) {
      ctx.body = error;
    }
  }

  public async editVoucher(ctx: Context): Promise<void> {
    try {
      const body: IVoucher = ctx.request.body;
      const { id } = ctx.params;
      const schema = Joi.object().keys({
        amount: Joi.number().optional(),
      });
      const value: IVoucher = await schema.validateAsync(body);
      await VoucherModel.updateOne(
        {
          _id: id,
        },
        {
          amount: value.amount,
        }
      );
      ctx.body = { message: "Voucher updated successfully" };
    } catch (error) {
      ctx.body = error;
    }
  }

  public async deleteVoucher(ctx: Context): Promise<void> {
    try {
      const { _id } = ctx.params;
      const { id } = ctx.state.user;

      await VoucherModel.deleteOne({ _id });
      await UserModel.updateOne(
        {
          _id: id,
        },
        {
          $pull: {
            vouchers: {
              voucher: _id,
            },
          },
        }
      );

      ctx.body = { message: "Voucher deleted successfully" };
    } catch (error) {
      ctx.body = error;
    }
  }

  public async closeVoucher(ctx: Context): Promise<void> {
    try {
      const { _id } = ctx.params;
      const { id } = ctx.state.user;
      const user: any = await UserModel.findOne({ _id: id }).exec();
      const voucher: any = await VoucherModel.findOne({ _id: _id }).exec();
      // console.log("User ", user.balance);
      // console.log("Req: ", voucher.amount);

      await VoucherModel.updateOne(
        {
          _id,
        },
        {
          status: "Inactive",
          used: true,
          expiredAt: new Date(),
        }
      );

      await UserModel.updateOne(
        {
          _id: id,
        },
        {
          balance: user.balance + voucher.amount,
        }
      );

      ctx.body = { message: "Voucher used successfully" };
    } catch (error) {
      ctx.body = error;
    }
  }
}
