import express from "express";
import { uploadImage } from "../../controllers/upload.controller";
import { upload } from "../../middlewares/upload.middleware";

const router = express.Router();

/**
 * @swagger
 * /api/v1/upload:
 *   post:
 *     summary: Upload an image to Cloudinary (server-side relay)
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               folder:
 *                 type: string
 *                 example: venraz/products
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No image file provided
 *       500:
 *         description: Upload failed
 */
router.post("/", upload.single("file"), uploadImage);

export const UploadRoutes = router;