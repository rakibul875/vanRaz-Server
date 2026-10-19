import slugify from "slugify";
import { SellerProduct } from "./product.model";
import {
  ICreateProductPayload,
  ISellerDashboardStats,
  IUpdateProductPayload,
} from "./seller.interface";

export const createProductIntoDB = async (payload: ICreateProductPayload) => {
  // Build a unique slug so the "slug_1" unique index never throws a
  // duplicate-key error (the main product flow does the same).
  let slug =
    (payload.slug || "").trim().toLowerCase() ||
    slugify(payload.name, { lower: true, strict: true }) ||
    `product-${Date.now()}`;

  while (await SellerProduct.exists({ slug })) {
    slug = `${slugify(payload.name, { lower: true, strict: true }) || `product-${Date.now()}`}-${Math.random().toString(36).slice(2, 7)}`;
  }
  payload.slug = slug;

  const result = await SellerProduct.create(payload);
  return result;
};

export const getMyProductsFromDB = async (sellerId: string) => {
  const result = await SellerProduct.find({ seller: sellerId });
  return result;
};

export const updateProductInDB = async (
  productId: string,
  payload: IUpdateProductPayload,
) => {
  const result = await SellerProduct.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

export const updateStockInDB = async (productId: string, stock: number) => {
  const result = await SellerProduct.findByIdAndUpdate(
    productId,
    { stock },
    { new: true },
  );
  return result;
};

export const getSellerDashboardStatsFromDB = async (
  sellerId: string,
): Promise<ISellerDashboardStats> => {
  const totalProducts = await SellerProduct.countDocuments({ seller: sellerId });

  return {
    totalProducts,
    totalOrders: 0,
    totalSales: 0,
  };
};
