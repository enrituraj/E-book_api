import express from "express"
const bookRouter = express.Router()
import { createBook, updateBook } from "./bookController"
import multer from "multer"
import path from "node:path"
import authenicate from "../middlewares/authenticate"

const upload = multer({
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits: { fieldSize: 3e7 },
})

bookRouter.post(
    "/",
    authenicate,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    createBook,
)

bookRouter.patch(
    "/:bookId",
    authenicate,
    upload.fields([
        { name: "coverImage", maxCount: 1 },
        { name: "file", maxCount: 1 },
    ]),
    updateBook,
)

export default bookRouter
