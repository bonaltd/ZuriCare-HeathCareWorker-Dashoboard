#!/usr/bin/env node
/**
 * Run seed-test-data.sql to load comprehensive test data.
 * Requires: schema, seed-demo.sql, and db-updates-clinic-settings.sql run first.
 *
 * npm run db:test-data
 */
import { spawn } from 'child_process';
import { createReadStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '3306';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'zuricare';

const sqlPath = join(__dirname, 'seed-test-data.sql');
if (!existsSync(sqlPath)) {
  console.error('SQL file not found:', sqlPath);
  process.exit(1);
}

const args = ['-h', dbHost, '-P', dbPort, '-u', dbUser];
if (dbPassword) args.push(`-p${dbPassword}`);
args.push(dbName);

console.log('Loading test data into', dbName, '...');

const proc = spawn('mysql', args, {
  stdio: ['pipe', 'inherit', 'inherit'],
});

createReadStream(sqlPath).pipe(proc.stdin);

proc.on('close', (code) => {
  if (code === 0) console.log('Test data loaded successfully.');
  process.exit(code ?? 0);
});

proc.on('error', (err) => {
  console.error('Failed to run mysql. Ensure MySQL/MariaDB client is installed and in PATH.');
  console.error(err.message);
  process.exit(1);
});
