import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

async function runMigrations() {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'matchquadra';

  console.log(`[MatchQuadra] Conectando ao MySQL em ${host}:${port} (banco: ${database})...`);

  // 1. Garante criação do database
  const bootstrapConn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  await bootstrapConn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await bootstrapConn.end();

  // 2. Conecta ao database e executa todas as migrations SQL em ordem
  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  const drizzleDir = path.resolve(process.cwd(), 'drizzle');
  const migrationFiles = fs
    .readdirSync(drizzleDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const filePath = path.join(drizzleDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`[MatchQuadra] Migration ${file} aplicada com sucesso.`);
  }

  console.log('[MatchQuadra] Estrutura MySQL pronta (sem dados mockados).');
  await pool.end();
}

runMigrations().catch(err => {
  console.error('[MatchQuadra] Falha ao rodar migrations MySQL:', err);
  process.exit(1);
});
