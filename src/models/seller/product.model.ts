import { Schema, model } from "mongoose";
import { ICreateProductPayload } from "./seller.interface";

const productSchema = new Schema<ICreateProductPayload>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    shop: { type: String, ref: "Shop", required: true },
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    brand: { type: String },
    isFeatured: { type: Boolean, default: false },
    isFlashSale: { type: Boolean, default: false },
    flashSalePrice: { type: Number },
    flashSaleEndDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Distinct model name mapped to the shared "products" collection. Without this,
// "Product" would collide with the main products model (which registers first),
// so the seller schema (status default "pending") would never be applied.
export const SellerProduct = model<ICreateProductPayload>(
  "SellerProduct",
  productSchema,
  "products",
);
