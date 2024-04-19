import { config } from "./src/config/config"

import app from "./src/app"
import connectDb from "./src/config/db"

const startServer = async () => {
    await connectDb()

    const port = config.port || 3000

    app.listen(port, () => {
        console.log(`App is running on port ${port}`)
    })
}

startServer()
