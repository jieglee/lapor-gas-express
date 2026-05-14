import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv"


dotenv.config()
//connection pool database 
const pool = new Pool ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})

pool.connect()
.then(()=> {
    console.log("Database connected")
})
.catch((err)=> {
    console.log(err)
})

export default pool;