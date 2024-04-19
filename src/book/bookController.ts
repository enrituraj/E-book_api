import { Request,Response,NextFunction } from "express-serve-static-core"


const createBook = (req:Request,res:Response,next:NextFunction) => {
    res.json({"msg":"welcome to book"})
}

export {createBook}