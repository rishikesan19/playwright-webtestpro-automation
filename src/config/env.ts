import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

/**
 * Centralised, validated runtime configuration.
 *
 * Resolution order (first wins): real process env -> `.env.<TEST_ENV>` -> `.env` -> defaults.
 * This lets CI inject values directly while developers keep local overrides in untracked files.
 */
const rootDir = path.resolve(__dirname, '..', '..');
const testEnv = process.env.TEST_ENV ?? 'production';

for (const file of [`.env.${testEnv}`, '.env']) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    // dotenv never overrides variables that are already set, which gives the precedence above.
    dotenv.config({ path: fullPath, quiet: true });
  }
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface EnvironmentConfig {
  readonly testEnv: string;
  readonly baseUrl: string;
  readonly apiBaseUrl: string;
  /** Optional fixed password for generated users; a random one is created per user when absent. */
  readonly testUserPassword: string | undefined;
  readonly apiResponseTimeLimitMs: number;
  readonly blockThirdPartyAds: boolean;
  readonly logLevel: LogLevel;
  readonly isCI: boolean;
  readonly workers: number | undefined;
  readonly retries: number | undefined;
}

function readUrl(name: string, fallback: string): string {
  const raw = (process.env[name] ?? fallback).trim().replace(/\/+$/, '');
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
  } catch {
    throw new Error(`Environment variable ${name} must be an absolute http(s) URL, received "${raw}"`);
  }
  return raw;
}

function readInt(name: string, fallback?: number): number | undefined {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Environment variable ${name} must be a non-negative integer, received "${raw}"`);
  }
  return value;
}

function readBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === undefined || raw === '') return fallback;
  if (['true', '1', 'yes'].includes(raw)) return true;
  if (['false', '0', 'no'].includes(raw)) return false;
  throw new Error(`Environment variable ${name} must be a boolean, received "${raw}"`);
}

function readLogLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? 'info').toLowerCase();
  const levels: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];
  if (!levels.includes(raw as LogLevel)) {
    throw new Error(`LOG_LEVEL must be one of ${levels.join(', ')}, received "${raw}"`);
  }
  return raw as LogLevel;
}

const baseUrl = readUrl('BASE_URL', 'https://automationexercise.com');

export const env: EnvironmentConfig = Object.freeze({
  testEnv,
  baseUrl,
  apiBaseUrl: readUrl('API_BASE_URL', `${baseUrl}/api`),
  testUserPassword: process.env.TEST_USER_PASSWORD || undefined,
  apiResponseTimeLimitMs: readInt('API_RESPONSE_TIME_LIMIT_MS', 3000) ?? 3000,
  blockThirdPartyAds: readBool('BLOCK_THIRD_PARTY_ADS', true),
  logLevel: readLogLevel(),
  isCI: readBool('CI', false),
  workers: readInt('WORKERS'),
  retries: readInt('RETRIES'),
});
