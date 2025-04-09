import express from "express";
import { addToCart, removeAllFromCart, updateQuantity, getCardProducts } from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware";

const router = express.Router();


router.get("/", protectRoute, getCardProducts);
router.post("/", protectRoute , addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity); 
  

export default router;


