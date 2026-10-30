import { randomBytes, randomUUID } from 'node:crypto';
import { env } from '@config/env';
import type { Country, Month, UserAccount } from '@test-data/types';

const FIRST_NAMES = ['Olivia', 'Amelia', 'Isla', 'Noah', 'Oliver', 'George', 'Arthur', 'Freya'] as const;
const LAST_NAMES = ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Evans', 'Patel'] as const;
const CITIES = ['Manchester', 'Leeds', 'Bristol', 'Glasgow', 'Cardiff', 'Belfast'] as const;
const MONTHS: readonly Month[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const COUNTRIES: readonly Country[] = ['India', 'United States', 'Canada', 'Australia', 'New Zealand'];

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * Globally unique, obviously synthetic address. `example.com` is reserved (RFC 2606),
 * so nothing is ever delivered to a real mailbox.
 */
export function uniqueEmail(prefix = 'wtp'): string {
  return `${prefix}.${Date.now().toString(36)}.${randomUUID().slice(0, 8)}@example.com`;
}

/** Uses TEST_USER_PASSWORD when provided, otherwise a strong random password per user. */
export function generatePassword(): string {
  return env.testUserPassword ?? `Wtp-${randomBytes(9).toString('base64url')}-9a`;
}

/** Builds a fresh, unique user. Each call returns a new object, so tests never share mutable data. */
export function buildUser(overrides: Partial<UserAccount> = {}): UserAccount {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);

  return {
    name: `${firstName} ${lastName}`,
    email: uniqueEmail(),
    password: generatePassword(),
    title: Math.random() < 0.5 ? 'Mr' : 'Mrs',
    birthDay: String(randomInt(1, 28)),
    birthMonth: pick(MONTHS),
    birthYear: String(randomInt(1960, 2000)),
    firstName,
    lastName,
    company: 'WebTestPro Ltd',
    address1: `${randomInt(1, 250)} Test Street`,
    address2: `Flat ${randomInt(1, 40)}`,
    country: pick(COUNTRIES),
    state: 'Testshire',
    city: pick(CITIES),
    zipcode: String(randomInt(10000, 99999)),
    mobileNumber: `07${randomInt(100000000, 999999999)}`,
    ...overrides,
  };
}
