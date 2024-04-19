import express from "express"
import { globalErrorHandler } from "./middlewares/globalErrorHandler"
import createHttpError from "http-errors"
import userRouter from "./user/userRouter"

const app = express()


app.use(express.json())

// Routes
app.get("/", (req, res,next) => {
    // const error = createHttpError(400,"something went wrong")
    // throw error;
    res.json({ msg: "welcome" })
})

//user router
app.use('/api/users',userRouter)



// global error hadler
app.use(globalErrorHandler)

export default app
