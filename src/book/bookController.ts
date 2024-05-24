import { Request, Response, NextFunction } from "express-serve-static-core"
import cloudinary from "../config/cloudinary"
import path, { format } from "node:path"
import createHttpError from "http-errors"
import bookModel from "./bookModel"
import fs from "node:fs"

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const {title,genre} = req.body;

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[]
        }

        const coverImageMimeType = files.coverImage[0].mimetype
            .split("/")
            .at(-1)

        const filename = files.coverImage[0].filename

        const filepath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            filename,
        )

        const uploadResult = await cloudinary.uploader.upload(filepath, {
            filename_override: filename,
            folder: "book-covers",
            format: coverImageMimeType,
        })

        const bookFilename = files.file[0].filename

        const bookFilepath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFilename,
        )

        const bookfileUploadResult = await cloudinary.uploader.upload(
            bookFilepath,
            {
                resource_type: "raw",
                filename_override: bookFilename,
                folder: "book-pdf",
                format: "pdf",
            },
        )

        const newBook = await bookModel.create({
            title,
            genre,
            author:"662243eb1664ceee7dcaabb6",
            coverImage:uploadResult.secure_url,
            file:bookfileUploadResult.secure_url
        })

        //delete temp file
        try {
            await fs.promises.unlink(filepath)
            await fs.promises.unlink(bookFilepath)
        } catch (error) {
            return next(createHttpError(500, "error in deleting temp file."))
        }
        

        res.status(201).json({
            id:newBook._id
        })

    } catch (error) {
        return next(createHttpError(500, "error in uploading file."))
    }
}

export { createBook }
