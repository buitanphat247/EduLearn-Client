/**
 * API Proxy Route Handler
 * Refactored to use separate services for better maintainability and testability
 */

import { NextRequest } from 'next/server';
import { proxyCache } from '../utils/cache';
import { rateLimiter } from '../utils/rateLimiter';
import { cookieFilter } from '../utils/cookieFilter';
import { ssrfProtection } from '../utils/ssrfProtection';
import { requestHandler } from '../utils/requestHandler';
import { responseHandler } from '../utils/responseHandler';
import { handleFetchError } from '../utils/errorHandler';

export const revalidate = 0;

const isDev = process.env.NODE_ENV === 'development';
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1611/api';

/**
 * Main request handler
 * Orchestrates all services to handle API proxy requests
 */
async function handleRequest(request: NextRequest, method: string) {
  // 1. Rate Limiting
  const clientIP = rateLimiter.getClientIP(request.headers);
  const rateLimitIdentifier = rateLimiter.createIdentifier('api-proxy', clientIP);
  const rateLimitResult = rateLimiter.checkRateLimit(rateLimitIdentifier);

  if (!rateLimitResult.success) {
    return responseHandler.createRateLimitResponse(
      rateLimitResult.limit,
      rateLimitResult.remaining,
      rateLimitResult.reset
    );
  }

  // 2. SSRF Protection - Validate path and URL
  const validation = ssrfProtection.validateRequest(request.url, backendUrl);
  if (!validation.valid) {
    return responseHandler.createErrorResponse(
      validation.error || 'Invalid request',
      403
    );
  }

  const { path, targetUrl } = validation;

  // 3. Extract userId for user-specific caching
  const cookieHeader = request.headers.get('cookie');
  const userId = cookieFilter.extractUserId(cookieHeader);

  // 4. Check cache for GET requests
  if (method === 'GET') {
    const url = new URL(request.url);
    const cached = proxyCache.get(method, path, url.search, userId);
    if (cached) {
      return new Response(cached.data, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...cached.headers,
        },
      });
    }
  }

  try {
    // 5. Build and execute request
    const requestConfig = await requestHandler.buildRequestConfig(
      request,
      method,
      targetUrl!
    );
    const response = await requestHandler.executeRequest(requestConfig);

    // 6. Process response
    const processedResponse = await responseHandler.processResponse(
      response,
      'MISS'
    );

    // 7. Cache successful GET responses
    if (method === 'GET' && response.status === 200) {
      const url = new URL(request.url);
      proxyCache.set(
        method,
        path!,
        url.search,
        processedResponse.data,
        processedResponse.headers,
        userId
      );
    }

    // 8. Log 401 errors in development
    if (isDev && response.status === 401) {
      console.log(`[Proxy] 401 ${method} ${path}`);
    }

    // 9. Return response
    return new Response(processedResponse.data, {
      status: processedResponse.status,
      headers: processedResponse.headers,
    });
  } catch (error: unknown) {
    // Handle fetch errors
    return handleFetchError(error, path || 'unknown', method);
  }
}

// Export HTTP method handlers
export const GET = (req: NextRequest) => handleRequest(req, 'GET');
export const POST = (req: NextRequest) => handleRequest(req, 'POST');
export const PUT = (req: NextRequest) => handleRequest(req, 'PUT');
export const PATCH = (req: NextRequest) => handleRequest(req, 'PATCH');
export const DELETE = (req: NextRequest) => handleRequest(req, 'DELETE');
