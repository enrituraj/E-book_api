import express from "express";
const bookRouter = express.Router()
import {createBook} from "./bookController"

bookRouter.post("/",createBook)

export default bookRouter
