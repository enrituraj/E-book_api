import express from "express"

const userRouter = express.Router()

import { createUser,loginUser } from "./userController"

// register route
userRouter.post("/register", createUser)

// login route
userRouter.post('/login',loginUser)

export default userRouter
