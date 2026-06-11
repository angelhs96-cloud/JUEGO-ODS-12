const sql = require('mssql');
require('dotenv').config();

const config = {
    server:   'localhost',
    database: 'reciclaje_ods12',
    port:     64456,
    user:     'ods_user',
    password: 'Ods12345!',
    options: {
        trustServerCertificate: true,
        enableArithAbort:       true
    }
};

let pool = null;

async function getPool() {
    if (pool) return pool;
    try {
        pool = await sql.connect(config);
        console.log('✅ Conexión a SQL Server establecida correctamente');
        return pool;
    } catch (error) {
        console.error('❌ Error al conectar con SQL Server:', error.message);
        throw error;
    }
}

getPool().catch(() => {});

module.exports = { sql, getPool };