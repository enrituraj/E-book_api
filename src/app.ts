import express from "express"
import { globalErrorHandler } from "./middlewares/globalErrorHandler"
import createHttpError from "http-errors"

const app = express()

// Routes
app.get("/", (req, res,next) => {
    // const error = createHttpError(400,"something went wrong")
    // throw error;
    res.json({ msg: "welcome" })
})


// global error hadler
app.use(globalErrorHandler)



export default app
