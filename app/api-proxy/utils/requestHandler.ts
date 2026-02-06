/**
 * Request Handler Service
 * Handles building and preparing requests to backend
 */

import { TIMEOUTS } from "../constants";
import { cookieFilter } from "./cookieFilter";

export interface RequestConfig {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: BodyInit;
  timeout?: number;
}

/**
 * Request Handler Service
 * Builds and prepares requests to backend
 */
export class RequestHandlerService {
  /**
   * Build request headers from incoming request
   * @param request - Incoming NextRequest
   * @returns Request headers object
   */
  buildHeaders(request: Request): Record<string, string> {
    const contentType = request.headers.get("content-type");
    const headers: Record<string, string> = {};

    // Only set Content-Type if provided and NOT multipart/form-data (let browser set boundary)
    // Or default to application/json if missing
    if (contentType && !contentType.includes("multipart/form-data")) {
      headers["Content-Type"] = contentType;
    } else if (!contentType) {
      headers["Content-Type"] = "application/json";
    }

    // Forward Authorization header
    const auth = request.headers.get("authorization");
    if (auth) {
      headers["Authorization"] = auth;
    }

    // Forward CSRF token
    const csrfToken = request.headers.get("x-csrf-token") || request.headers.get("X-CSRF-Token");
    if (csrfToken) {
      headers["X-CSRF-Token"] = csrfToken;
    }

    // Filter and forward cookies
    const cookie = request.headers.get("cookie");
    const filteredCookie = cookieFilter.filterCookies(cookie);
    if (filteredCookie) {
      headers["Cookie"] = filteredCookie;
    }

    return headers;
  }

  /**
   * Extract request body for state-changing methods
   * @param request - Incoming NextRequest
   * @param method - HTTP method
   * @returns Request body string, FormData or undefined
   */
  async extractBody(request: Request, method: string): Promise<BodyInit | undefined> {
    if (!["POST", "PUT", "PATCH"].includes(method)) {
      return undefined;
    }

    try {
      const contentType = request.headers.get("content-type");
      if (contentType && contentType.includes("multipart/form-data")) {
        return await request.formData();
      }
      return await request.text();
    } catch {
      return undefined;
    }
  }

  /**
   * Build complete request configuration
   * @param request - Incoming NextRequest
   * @param method - HTTP method
   * @param targetUrl - Target backend URL
   * @param timeout - Request timeout in milliseconds
   * @returns Request configuration
   */
  async buildRequestConfig(request: Request, method: string, targetUrl: string, timeout: number = TIMEOUTS.DEFAULT): Promise<RequestConfig> {
    const headers = this.buildHeaders(request);
    const body = await this.extractBody(request, method);

    return {
      method,
      url: targetUrl,
      headers,
      body,
      timeout,
    };
  }

  /**
   * Execute request with timeout
   * @param config - Request configuration
   * @returns Fetch Response
   */
  async executeRequest(config: RequestConfig): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || TIMEOUTS.DEFAULT);

    try {
      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body || undefined,
        signal: controller.signal,
      });

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// Singleton instance
export const requestHandler = new RequestHandlerService();
