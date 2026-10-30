import { expect as baseExpect } from '@playwright/test';
import type { ApiResponse } from '@api/ApiClient';
import { validateSchema, type SchemaName } from './schemaValidator';

/**
 * automationexercise.com always answers with HTTP 200 and reports the real outcome in the body's
 * `responseCode`. Keeping that contract in one constant makes it trivial to adapt if the API ever
 * starts returning proper HTTP status codes.
 */
export const API_TRANSPORT_STATUS = 200;

function describeRequest(response: ApiResponse): string {
  return `${response.method} ${response.url}`;
}

/**
 * Domain-specific matchers so API specs read as intent, with failure messages that include the
 * request and the server's message instead of a bare "expected 404 to be 200".
 */
export const expect = baseExpect.extend({
  toHaveResponseCode(response: ApiResponse, expected: number) {
    const actualCode = response.body.responseCode;
    const pass = response.httpStatus === API_TRANSPORT_STATUS && actualCode === expected;
    return {
      pass,
      name: 'toHaveResponseCode',
      expected,
      actual: actualCode,
      message: () =>
        `${describeRequest(response)}\n` +
        `Expected: ${this.isNot ? 'not ' : ''}HTTP ${API_TRANSPORT_STATUS} with responseCode ${expected}\n` +
        `Received: HTTP ${response.httpStatus} with responseCode ${actualCode}` +
        (response.body.message ? ` ("${response.body.message}")` : ''),
    };
  },

  toMatchSchema(response: ApiResponse, schema: SchemaName) {
    const { valid, errors } = validateSchema(schema, response.body);
    return {
      pass: valid,
      name: 'toMatchSchema',
      expected: schema,
      message: () =>
        this.isNot
          ? `${describeRequest(response)}\nExpected body not to match schema "${schema}"`
          : `${describeRequest(response)}\nBody does not match schema "${schema}":\n  - ${errors.join('\n  - ')}`,
    };
  },

  toRespondWithin(response: ApiResponse, limitMs: number) {
    const pass = response.durationMs <= limitMs;
    return {
      pass,
      name: 'toRespondWithin',
      expected: limitMs,
      actual: response.durationMs,
      message: () =>
        `${describeRequest(response)}\n` +
        `Expected response time ${this.isNot ? '>' : '<='} ${limitMs}ms, received ${response.durationMs}ms`,
    };
  },
});
