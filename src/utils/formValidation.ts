import type { Locator } from '@playwright/test';

export interface FieldValidity {
  valid: boolean;
  valueMissing: boolean;
  typeMismatch: boolean;
  validationMessage: string;
}

/**
 * Reads the browser's native constraint-validation state for a form control.
 * The validation message text differs per browser, so tests should assert on the flags.
 */
export async function getValidity(field: Locator): Promise<FieldValidity> {
  return field.evaluate((element) => {
    const input = element as HTMLInputElement;
    return {
      valid: input.validity.valid,
      valueMissing: input.validity.valueMissing,
      typeMismatch: input.validity.typeMismatch,
      validationMessage: input.validationMessage,
    };
  });
}

/** True when the browser's native constraint validation reports a missing required value. */
export async function isValueMissing(field: Locator): Promise<boolean> {
  return (await getValidity(field)).valueMissing;
}
