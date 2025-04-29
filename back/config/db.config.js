/**
 * Connexion à la base de données avec mysql2 (mode Promesses).
 *
 * Ce module crée un pool de connexions MySQL en utilisant `mysql2/promise`.
 * Pour exécuter des requêtes en mode asynchrone avec `async/await`.
 *
 * @returns {Pool} Un pool de connexions MySQL permettant des requêtes en mode Promesses.
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  pool: {
    handleDisconnect: () => {
      return pool;
    },
  },
  port: process.env.DB_PORT,
});

export default pool;
