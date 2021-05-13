import Joi from "@hapi/joi";
import { Context } from "koa";
import Web3 from "web3";

import { IVoucher } from "../../interface/voucher.interface";
import { VoucherModel } from "../../models/voucher/Voucher.model";
import { UserModel } from "../../models/user/User.model";
// import { IUser } from "../../interface/user.interface";

const Subscription = require("../../config/Subscription.json");

const RANDOM_VALUE_MULTIPLIER = 10001;

const voucherGeneratedId: string = `${Math.floor(Math.random() * RANDOM_VALUE_MULTIPLIER)}`;

const initCreate = async (amount: number) => {
  const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
  const id = await web3.eth.net.getId();
  const deployedNetwork = Subscription.networks[id];
  const contract = new web3.eth.Contract(Subscription.abi, deployedNetwork.address);
  const addresses: any = await web3.eth.getAccounts();

  await contract.methods.createVoucher(voucherGeneratedId, amount).send({
    // const receipt = await contract.methods.createVoucher(voucherGeneratedId, amount).send({
    from: addresses[0],
    gas: 4700000,
    gasPrice: "2000000000",
  });

  // const voucher = await contract.methods.getVouchers(1).call();

  // console.log("Receipt", receipt);
  // console.log("Vouchers", voucher);
};

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
      value.voucherId = voucherGeneratedId;
      const voucher = await VoucherModel.create(value);

      initCreate(ctx.request.body.amount);

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
      console.log("Amount", ctx.request.body.amount);
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
