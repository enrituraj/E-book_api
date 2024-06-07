import { Request, Response, NextFunction } from "express-serve-static-core"
import cloudinary from "../config/cloudinary"
import path, { format } from "node:path"
import createHttpError from "http-errors"
import bookModel from "./bookModel"
import fs from "node:fs"
import { AuthRequest } from "../middlewares/authenticate"

const createBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, genre } = req.body

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

        console.log("BookFileUploadResult : ", bookfileUploadResult)
        console.log("uploadResult : ", uploadResult)

        const _req = req as AuthRequest

        console.log("user id", _req.userId)

        const newBook = await bookModel.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadResult.secure_url,
            file: bookfileUploadResult.secure_url,
        })

        //delete temp file
        try {
            await fs.promises.unlink(filepath)
            await fs.promises.unlink(bookFilepath)
        } catch (error) {
            return next(createHttpError(500, "error in deleting temp file."))
        }

        res.status(201).json({
            id: newBook._id,
        })
    } catch (error) {
        return next(createHttpError(500, "error in uploading file."))
    }
}

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
    const { title, description, genre } = req.body
    const bookId = req.params.bookId

    const book = await bookModel.findOne({ _id: bookId })

    if (!book) {
        return next(createHttpError(404, "Book not found"))
    }

    const _req = req as AuthRequest
    if (book.author.toString() !== _req.userId) {
        return next(createHttpError(403, "You can not update others book."))
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    let completeCoverImage = ""
    if (files.coverImage) {
        const filename = files.coverImage[0].filename
        const converMimeType = files.coverImage[0].mimetype.split("/").at(-1)
        // send files to cloudinary
        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads/" + filename,
        )
        completeCoverImage = filename
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: completeCoverImage,
            folder: "book-covers",
            format: converMimeType,
        })

        completeCoverImage = uploadResult.secure_url
        await fs.promises.unlink(filePath)
    }

    let completeFileName = ""
    if (files.file) {
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads/" + files.file[0].filename,
        )

        const bookFileName = files.file[0].filename
        completeFileName = bookFileName

        const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
            resource_type: "raw",
            filename_override: completeFileName,
            folder: "book-pdfs",
            format: "pdf",
        })

        completeFileName = uploadResultPdf.secure_url
        await fs.promises.unlink(bookFilePath)
    }

    const updatedBook = await bookModel.findOneAndUpdate(
        {
            _id: bookId,
        },
        {
            title: title,
            description: description,
            genre: genre,
            coverImage: completeCoverImage
                ? completeCoverImage
                : book.coverImage,
            file: completeFileName ? completeFileName : book.file,
        },
        { new: true },
    )

    res.json(updatedBook)
}

export { createBook, updateBook }
