import { Request, Response } from "express";
import {
  createProductIntoDB,
  getMyProductsFromDB,
  updateProductInDB,
  updateStockInDB,
  getSellerDashboardStatsFromDB,
} from "./product.service";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const result = await createProductIntoDB(req.body);
    
    return res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: result,
    });
  } catch (error: any) {
    // Duplicate slug (slug_1 unique index)
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: `A product with the slug "${error.keyValue?.slug}" already exists. Please use a different name or slug.`,
        error: error.message,
      });
    }
    // Mongoose validation / type-cast failures
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const sellerId = req.params.sellerId as string;
    const result = await getMyProductsFromDB(sellerId);

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully!",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const result = await updateProductInDB(productId, req.body);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully!",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const productId = req.params.productId as string;
    const { stock } = req.body;
    const result = await updateStockInDB(productId, stock);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully!",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

export const getSellerDashboardStats = async (req: Request, res: Response) => {
  try {
    const sellerId = req.params.sellerId as string;
    const result = await getSellerDashboardStatsFromDB(sellerId);

    return res.status(200).json({
      success: true,
      message: "Seller stats fetched successfully!",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seller stats",
      error: error.message,
    });
  }
};
