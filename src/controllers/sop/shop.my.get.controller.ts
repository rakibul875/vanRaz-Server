import { Request, Response } from "express";
import { Shop } from "../../models/sop/sop.model";
import { Product } from "../../models/products/product.model";

export const getMyShops = async (req: Request, res: Response) => {
  try {
    const { ownerId } = req.params;

    // 1. Find shop using ownerId
    const shop = await Shop.findOne({ ownerId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found for this owner!",
      });
    }
  
    // console.log(shop.ownerId, matchProducts);
    // 2. Find products where product.shop === shop._id
    const products = await Product.find({
      shop: ownerId,
      isDeleted: false,
    });
    // console.log(products);
    return res.status(200).json({
      success: true,
      message: "My shop products fetched successfully!",
      data: {
        shop,
        products,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch my shop products",
      error: error.message,
    });
  }
};
