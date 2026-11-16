import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from './schema.ts';

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

export function getMysqlConfig() {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'matchquadra'
  };
}

export function getMysqlPool(): mysql.Pool {
  if (!global._mysqlPool) {
    const cfg = getMysqlConfig();
    global._mysqlPool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      connectTimeout: 2500
    });
  }
  return global._mysqlPool;
}

export function getDb() {
  return drizzle(getMysqlPool(), { schema, mode: 'default' });
}
