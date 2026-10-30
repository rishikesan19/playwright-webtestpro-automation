import type { APIRequestContext } from '@playwright/test';
import { env } from '@config/env';
import { createLogger } from '@utils/logger';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type FormFields = Record<string, string>;

export interface RequestOptions {
  /** Sent as application/x-www-form-urlencoded, which is what every documented endpoint expects. */
  form?: FormFields;
  params?: Record<string, string>;
}

/**
 * Every automationexercise.com API body carries a `responseCode`.
 * NOTE: the transport-level HTTP status is always 200; the business status lives in this field.
 */
export interface ApiBody {
  responseCode: number;
  message?: string;
}

export interface ApiResponse<TBody extends ApiBody = ApiBody> {
  method: HttpMethod;
  url: string;
  httpStatus: number;
  contentType: string | undefined;
  durationMs: number;
  body: TBody;
}

const log = createLogger('api');

/**
 * Thin wrapper over Playwright's APIRequestContext that handles base URL resolution,
 * JSON parsing (the API mislabels JSON as text/html), timing and logging.
 * Endpoint-specific clients compose this rather than extending it.
 */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string = env.apiBaseUrl,
  ) {}

  async send<TBody extends ApiBody = ApiBody>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<TBody>> {
    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
    const startedAt = performance.now();
    const response = await this.request.fetch(url, {
      method,
      ...(options.form && { form: options.form }),
      ...(options.params && { params: options.params }),
    });
    const durationMs = Math.round(performance.now() - startedAt);
    const text = await response.text();

    let body: TBody;
    try {
      body = JSON.parse(text) as TBody;
    } catch {
      const reason =
        response.status() >= 500
          ? 'the site is unavailable (server/CDN error page, not an API response)'
          : 'non-JSON content';
      throw new Error(
        `${method} ${url} returned ${reason} (HTTP ${response.status()}): ${text.slice(0, 200)}`,
      );
    }

    log.debug(
      `${method} ${url} -> HTTP ${response.status()} / responseCode ${body.responseCode} in ${durationMs}ms`,
    );

    return {
      method,
      url,
      httpStatus: response.status(),
      contentType: response.headers()['content-type'],
      durationMs,
      body,
    };
  }

  get<TBody extends ApiBody = ApiBody>(endpoint: string, params?: Record<string, string>) {
    return this.send<TBody>('GET', endpoint, params ? { params } : {});
  }

  post<TBody extends ApiBody = ApiBody>(endpoint: string, form?: FormFields) {
    return this.send<TBody>('POST', endpoint, form ? { form } : {});
  }

  put<TBody extends ApiBody = ApiBody>(endpoint: string, form?: FormFields) {
    return this.send<TBody>('PUT', endpoint, form ? { form } : {});
  }

  delete<TBody extends ApiBody = ApiBody>(endpoint: string, form?: FormFields) {
    return this.send<TBody>('DELETE', endpoint, form ? { form } : {});
  }
}
