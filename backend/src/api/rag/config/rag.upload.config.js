import multer from "multer";
import path from "path";
import fs from "fs";
import { StatusCodes } from "http-status-codes";

const uploadDir = process.env.RAG_UPLOAD_DIR || "uploads/rag";
const maxUploadMb = Number(process.env.RAG_MAX_UPLOAD_MB) || 10;

export const ragUploadRoot = path.resolve(process.cwd(), uploadDir);

if (!fs.existsSync(ragUploadRoot)) {
  fs.mkdirSync(ragUploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userDir = path.join(
      ragUploadRoot,
      String(req.user?.id || "anonymous"),
    );
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase() || ".bin";
    cb(null, `${unique}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();

  const allowedExtensions = [".pdf", ".txt"];
  const allowedMimeTypes = ["application/pdf", "text/plain"];

  const extensionOk = allowedExtensions.includes(extension);
  const mimeOk = allowedMimeTypes.includes(file.mimetype);
  console.log("fileFilter");
  // Accept if EITHER the extension OR the mimetype matches
  if (extensionOk || mimeOk) {
    cb(null, true);
    return;
  }
  cb(new Error("Only PDF and TXT files are supported."));
}

export const ragUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxUploadMb * 1024 * 1024 },
});

/**
 * Turns multer errors (file too large, wrong type, etc.) into a clean
 * 400 JSON response instead of letting them bubble up as 500s.
 */
export function createDocumentMulterErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const msg =
      err.code === "LIMIT_FILE_SIZE"
        ? `File exceeds the ${maxUploadMb}MB upload limit.`
        : err.message;
    return res.status(StatusCodes.BAD_REQUEST).json({ msg });
  }
  if (err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: err.message || "Upload failed." });
  }
  next();
}
