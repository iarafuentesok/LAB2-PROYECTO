// backend/middlewares/upload.middleware.js
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const nombreFinal = Date.now() + "-" + file.originalname;
    cb(null, nombreFinal);
  },
});

export const upload = multer({ storage });
