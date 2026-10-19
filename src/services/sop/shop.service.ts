import { Shop } from "../../models/sop/sop.model";
import { Product } from "../../models/products/product.model";
import { IShop } from "../../types/sop/sop";

export const createShopIntoDB = async (payload: IShop) => {
  const result = await Shop.create(payload);
  return result;
};

export const deleteShopFromDB = async (shopId: string) => {
  const shop = await Shop.findByIdAndDelete(shopId);
  if (shop) {
    // Soft-delete the shop's products so they don't become orphaned.
    await Product.updateMany(
      { shop: String(shop._id) },
      { $set: { isDeleted: true } },
    );
  }
  return shop;
};
