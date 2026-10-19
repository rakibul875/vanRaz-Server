import mongoose, { Types } from 'mongoose';
import { Wishlist } from './wishlist.model';
import { IWishlistDocument, IUserDashboardOverview } from './wishlist.interface';
import { Product } from '../products/product.model';

// Populate returns `null` for removed (soft-deleted) products, which would
// otherwise break clients mapping over productIds. Filter those entries out.
const cleanPopulated = (wishlist: IWishlistDocument | null): IWishlistDocument | null => {
  if (wishlist && Array.isArray(wishlist.productIds)) {
    wishlist.productIds = wishlist.productIds.filter(
      (item) => item !== null && item !== undefined
    ) as IWishlistDocument['productIds'];
  }
  return wishlist;
};

const addToWishlistInDB = async (
  userId: string,
  productId: string
): Promise<IWishlistDocument> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const productExists = await Product.exists({
    _id: productId,
    isDeleted: { $ne: true },
  });
  if (!productExists) {
    throw { statusCode: 404, message: 'Product not found' };
  }

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      userId,
      productIds: [new Types.ObjectId(productId)],
    });
  } else {
    const productIdStr = productId.toString();
    const exists = wishlist.productIds.some(
      (id) => id.toString() === productIdStr
    );

    if (!exists) {
      (wishlist.productIds as any).push(new Types.ObjectId(productId));
      await wishlist.save();
    }
  }

  return cleanPopulated(
    (await wishlist.populate('productIds')) as IWishlistDocument
  ) as IWishlistDocument;
};

const getWishlistFromDB = async (userId: string): Promise<IWishlistDocument | null> => {
  let wishlist = await Wishlist.findOne({ userId }).populate('productIds');

  if (!wishlist) {
    wishlist = await Wishlist.create({
      userId,
      productIds: [],
    });
  }

  return cleanPopulated(wishlist);
};

const removeFromWishlistInDB = async (
  userId: string,
  productId: string
): Promise<IWishlistDocument | null> => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw { statusCode: 400, message: 'Invalid product ID format' };
  }

  const wishlist = await Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { productIds: productId } },
    { new: true }
  ).populate('productIds');

  if (!wishlist) {
    throw { statusCode: 404, message: 'Wishlist not found for user' };
  }

  return cleanPopulated(wishlist);
};

const getUserDashboardOverviewFromDB = async (
  userId: string
): Promise<IUserDashboardOverview> => {
  const wishlist = await Wishlist.findOne({ userId });
  const wishlistCount = wishlist ? wishlist.productIds.length : 0;

  let totalOrders = 0;
  let pendingOrders = 0;
  let completedOrders = 0;

  try {
    const OrderModel = mongoose.models.Order;
    if (OrderModel) {
      totalOrders = await OrderModel.countDocuments({ userId });
      pendingOrders = await OrderModel.countDocuments({
        userId,
        orderStatus: { $in: ['pending', 'processing'] },
      });
      completedOrders = await OrderModel.countDocuments({
        userId,
        orderStatus: 'delivered',
      });
    }
  } catch (error) {
    console.warn('Order collection query skipped during overview calculation.');
  }

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    wishlistCount,
  };
};

export const WishlistService = {
  addToWishlistInDB,
  getWishlistFromDB,
  removeFromWishlistInDB,
  getUserDashboardOverviewFromDB,
};
