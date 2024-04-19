import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import userModel from "./userModel"
import bcrypt from "bcrypt"

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body
    // validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "all fields are required")
        return next(error)
    }
    // email validation
    const user = await userModel.findOne({ email })
    if (user) {
        const error = createHttpError(400, "user already exists, try another")
        return next(error)
    }

    //password hash
    const hashedPassword = await bcrypt.hash(password, 10)

    // save data to database
    const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
    })

    //response

    res.json({ id: newUser._id })
}

export { createUser }
