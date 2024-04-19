import mongoose from "mongoose"
import { config } from "./config"

const connectDb = async () => {
    try {
        mongoose.connection.on("connected", () => {
            console.log("Database connected successfully")
        })

        mongoose.connection.on("error", () => {
            console.log("Error : Error in connecting DB.")
        })
        await mongoose.connect(config.databaseURL as string)
    } catch (error) {
        console.log("Error: Database connection Failed.", error)
        process.exit(1)
    }
}

export default connectDb
