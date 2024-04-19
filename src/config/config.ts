import {config as conf} from "dotenv"
conf();

const _config = {
    port:process.env.PORT,
    databaseURL:process.env.MONGODB_CONNECTION_STRING,

}

export const config = Object.freeze(_config);

