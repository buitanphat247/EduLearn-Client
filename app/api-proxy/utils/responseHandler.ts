/**
 * Response Handler Service
 * Handles processing and formatting responses from backend
 */

import { cookieFilter } from './cookieFilter';

export interface ProcessedResponse {
  data: string;
  status: number;
  headers: Headers;
  cacheStatus: 'HIT' | 'MISS';
}

/**
 * Response Handler Service
 * Processes and formats responses from backend
 */
export class ResponseHandlerService {
  /**
   * Process response data based on content type
   * @param response - Fetch Response object
   * @returns Processed response data as string
   */
  async processResponseData(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return JSON.stringify(data);
    }

    return await response.text();
  }

  /**
   * Build response headers from backend response
   * @param response - Fetch Response object
   * @returns Headers object with processed Set-Cookie headers
   */
  buildResponseHeaders(response: Response): Headers {
    const contentType = response.headers.get('content-type');
    const responseHeaders = new Headers({
      'Content-Type': contentType || 'application/json',
    });

    // Process and forward Set-Cookie headers
    const cleanedCookies = cookieFilter.processSetCookies(response);
    cleanedCookies.forEach(cookie => {
      responseHeaders.append('Set-Cookie', cookie);
    });

    return responseHeaders;
  }

  /**
   * Process complete response from backend
   * @param response - Fetch Response object
   * @param cacheStatus - Cache status ('HIT' or 'MISS')
   * @returns Processed response with data, status, and headers
   */
  async processResponse(
    response: Response,
    cacheStatus: 'HIT' | 'MISS' = 'MISS'
  ): Promise<ProcessedResponse> {
    const data = await this.processResponseData(response);
    const headers = this.buildResponseHeaders(response);

    // Add cache status header
    headers.set('X-Cache', cacheStatus);

    return {
      data,
      status: response.status,
      headers,
      cacheStatus,
    };
  }

  /**
   * Create error response
   * @param message - Error message
   * @param status - HTTP status code
   * @returns NextResponse with error
   */
  createErrorResponse(message: string, status: number = 500): Response {
    return new Response(
      JSON.stringify({
        status: false,
        message,
        data: null,
      }),
      {
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  /**
   * Create rate limit error response
   * @param limit - Rate limit value
   * @param remaining - Remaining requests
   * @param reset - Reset time in seconds
   * @returns NextResponse with rate limit error
   */
  createRateLimitResponse(
    limit: number,
    remaining: number,
    reset: number
  ): Response {
    return new Response(
      JSON.stringify({
        status: false,
        message: `Rate limit exceeded. Try again in ${reset} seconds.`,
        data: null,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }
}

// Singleton instance
export const responseHandler = new ResponseHandlerService();
