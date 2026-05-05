import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
    host:     'localhost',
    user:     'root',
    database: 'db_aas_pengaduan',
    password: 'amantaruna20'
});

export default connection