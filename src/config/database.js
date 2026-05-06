import pkg from "pg";
const { Pool } = pkg;


//connection pool database 
const pool = new Pool ({
    host: "localhost",
    user: "postgres",
    database: "db_laporgas",
    port: 5432
})

export default pool;