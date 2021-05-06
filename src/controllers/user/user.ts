import { Context } from "koa";

import { UserModel } from "../../models/user/User.model";

export class User {
  public async getUser(ctx: Context): Promise<void> {
    try {
      const { id } = ctx.state.user;
      const user = await UserModel.findOne({ _id: id }, { password: 0 }).populate(
        "vouchers.voucher"
      );
      ctx.body = { message: "user found successfully", user };
    } catch (error) {
      ctx.body = error;
    }
  }
}
