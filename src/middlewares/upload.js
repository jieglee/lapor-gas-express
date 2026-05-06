import multer from "multer"
import path from "path"
import crypto from "crypto"

// storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname)
        const randomName = crypto.randomBytes(16).toString("hex")
        cb(null, randomName + ext)
    }
})

// filter file (hanya gambar)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb(new Error("Only image files allowed"), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // max 2MB
    }
})

export default upload