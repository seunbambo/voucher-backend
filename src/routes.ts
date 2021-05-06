import Router from "koa-router";

import { Auth } from "./controllers/auth/auth";
import { Voucher } from "./controllers/voucher/voucher";
import { User } from "./controllers/user/user";
import { verifyToken } from "./helpers/auth";

export function registerRoutes() {
  const router = new Router();

  // Define routes

  // AUTH ROUTES
  router.post("/register", Auth.prototype.create);
  router.post("/login", Auth.prototype.login);

  // USER ROUTES
  router.get("/user", verifyToken, User.prototype.getUser);

  // VOUCHER ROUTES
  router.get("/vouchers", verifyToken, Voucher.prototype.getAllVouchers);
  router.post("/vouchers/add", verifyToken, Voucher.prototype.addVoucher);
  router.put("/voucher/:id", verifyToken, Voucher.prototype.editVoucher);
  router.put("/vouchers/mark-voucher/:_id", verifyToken, Voucher.prototype.closeVoucher);
  router.delete("/vouchers/:_id", verifyToken, Voucher.prototype.deleteVoucher);

  return router;
}
