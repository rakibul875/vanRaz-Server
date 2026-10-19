import { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { uploadToCloudinaryWithMeta } from "../middlewares/upload.middleware";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const sendUploaded = (
  res: Response,
  secureUrl: string,
  publicId: string,
  provider: "cloudinary" | "local",
) => {
  return res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      secure_url: secureUrl,
      public_id: publicId,
      provider,
    },
  });
};

export const uploadImage = async (req: Request, res: Response) => {
  const file = req.file;
  console.log(file);
  if (!file) {
    return res.status(400).json({
      success: false,
      message: "No image file provided. Use multipart field name: file",
    });
  }

  const folder = (req.body.folder as string) || "venraz/products";

  try {
    const { secureUrl, publicId } = await uploadToCloudinaryWithMeta(
      file.buffer,
      folder,
    );
    return sendUploaded(res, secureUrl, publicId, "cloudinary");
  } catch (cloudErr: any) {
    console.warn(
      `⚠️ Cloudinary upload failed (${cloudErr?.message || "unknown"}). Falling back to local storage.`,
    );
  }

  try {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);

    const protocol = req.get("x-forwarded-proto") || req.protocol;
    const host = req.get("host") || "localhost:5000";
    const secureUrl = `${protocol}://${host}/uploads/${filename}`;

    return sendUploaded(res, secureUrl, `local/${filename}`, "local");
  } catch (localErr: any) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: localErr.message,
    });
  }
};
