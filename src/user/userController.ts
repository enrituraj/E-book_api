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

        res.status(201).json({ accessToken: jwtToken })
    } catch (error) {
        return next(createHttpError(500, "error at signing the token"))
    }
}

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    // data
    const { email, password } = req.body
    if (!email || !password) {
        return next(createHttpError(400, "Please enter a valid email & pasword."))
    }

    // matching the data
    try {
        const user = await userModel.findOne({ email })
        if (!user) {
            return next(createHttpError(404, "User not found !!"))
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return next(createHttpError(400, "Email or password incorrect."))
        }

        // generating jwt

        try {
            const jwtToken = sign(
                {
                    sub: user._id,
                },
                config.jwtSecret as string,
                {
                    expiresIn: "7d",
                },
            )

            res.status(201).json({ accessToken: jwtToken })
        } catch (error) {
            return next(createHttpError(500, "error at signing the token"))
        }
    } catch (error) {
        return next(createHttpError(500, "Error at fetching user data"))
    }
}

export { createUser, loginUser }
