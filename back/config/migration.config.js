import fs from "fs";
import path from "path";

import pool from "./db.config.js";
import { __dirname } from "../utils/dirname.utils.js";

async function runMigrations() {
  const migrationPath = path.join(__dirname, "../migrations");

  if (!fs.existsSync(migrationPath)) {
    console.log("Le dossier migrations n'existe pas.");
    process.exit(1);
  }

  const files = fs.readdirSync(migrationPath).sort();

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const file of files) {
      const filePath = path.join(migrationPath, file);
      if (path.extname(filePath) === ".sql") {
        const [existingMigration] = await pool.query(
          "SELECT * FROM migrations WHERE name = ?",
          [file]
        );

        if (existingMigration.length === 0) {
          console.log(`Execute : ${file}`);
          try {
            const sql = fs.readFileSync(filePath, "utf8");
            await pool.query(sql);
            await pool.query("INSERT INTO migrations (name) VALUES (?)", [
              file,
            ]);
          } catch (readErr) {
            console.log(
              `Erreur lors de l'exécution du fichier ${file}:`,
              readErr
            );
          }
        } else {
          console.log(`Déjà migré : ${file}`);
        }
      }
    }

    console.log("Migrations terminées avec succès.");
  } catch (err) {
    console.log("Erreur lors de la migration :", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

await runMigrations();
