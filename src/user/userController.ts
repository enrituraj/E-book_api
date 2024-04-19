import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import userModel from "./userModel"
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken"
import { config } from "../config/config"
import { User } from "./userType"

const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body
    // validation
    if (!name || !email || !password) {
        const error = createHttpError(400, "all fields are required")
        return next(error)
    }
    // email validation
    try {
        const user = await userModel.findOne({ email })
        if (user) {
            const error = createHttpError(
                400,
                "user already exists, try another",
            )
            return next(error)
        }
    } catch (error) {
        return next(createHttpError(500, "Error while getting user"))
    }

    //password hash

    const hashedPassword = await bcrypt.hash(password, 10)

    let newUser: User
    try {
        // save data to database
        newUser = await userModel.create({
            name,
            email,
            password: hashedPassword,
        })
    } catch (error) {
        return next(createHttpError(500, "Error while saving data."))
    }

    //generating jwt token

    try {
        const jwtToken = sign(
            {
                sub: newUser._id,
            },
            config.jwtSecret as string,
            {
                expiresIn: "7d",
            },
        )

        res.json({ accessToken: jwtToken })
    } catch (error) {
        return next(createHttpError(500, "error at signing the token"))
    }
}

export { createUser }
