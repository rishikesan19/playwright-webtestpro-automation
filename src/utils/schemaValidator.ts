import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import brandList from '@api/schemas/brand-list.schema.json';
import message from '@api/schemas/message.schema.json';
import productList from '@api/schemas/product-list.schema.json';
import userDetail from '@api/schemas/user-detail.schema.json';

const schemas = {
  'brand-list': brandList,
  message,
  'product-list': productList,
  'user-detail': userDetail,
} as const;

export type SchemaName = keyof typeof schemas;

export interface SchemaValidationResult {
  valid: boolean;
  errors: string[];
}

// One Ajv instance per worker; compiled validators are cached by Ajv itself.
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
for (const schema of Object.values(schemas)) ajv.addSchema(schema);

function describe(error: ErrorObject): string {
  const location = error.instancePath || '(root)';
  const detail = error.params && Object.keys(error.params).length ? ` ${JSON.stringify(error.params)}` : '';
  return `${location} ${error.message ?? 'is invalid'}${detail}`;
}

export function validateSchema(name: SchemaName, data: unknown): SchemaValidationResult {
  const validate = ajv.getSchema(name) as ValidateFunction | undefined;
  if (!validate) throw new Error(`Unknown JSON schema "${name}"`);
  const valid = validate(data);
  return { valid, errors: valid ? [] : (validate.errors ?? []).map(describe) };
}
