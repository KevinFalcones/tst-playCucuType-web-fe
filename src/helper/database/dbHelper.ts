//This file is to implement an async connection pool as a good practice
import mysql, { Pool, RowDataPacket } from "mysql2/promise";

export default class DatabaseHelper {
    private static pool: Pool;

    // Inicializa o reutiliza el Pool de conexiones (Patrón Singleton)
    private static getPool(): Pool {
        if (!this.pool) {
            this.pool = mysql.createPool({
                host: process.env.DB_HOST || "localhost",
                user: process.env.DB_USER || "root",
                password: process.env.DB_PASS || "root",
                database: process.env.DB_NAME || "automation_db",
                port: Number(process.env.DB_PORT) || 3306,
                waitForConnections: true,
                connectionLimit: 5,
                queueLimit: 0
            });
        }
        return this.pool;
    }

    // Ejecuta una consulta SELECT parametrizada para prevenir SQL Injection
    public static async executeQuery<T extends RowDataPacket>(
        sql: string,
        params: any[] = []
    ): Promise<T[]> {
        const pool = this.getPool();
        const [rows] = await pool.execute<T[]>(sql, params);
        return rows;
    }

    // Cierra el pool limpiamente al terminar toda la suite (en AfterAll)
    public static async closePool(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
        }
    }
}