// Suppress Next.js warnings in development (server-side only)
export async function register() {
  if (process.env.NODE_ENV === "development") {
    const originalWarn = console.warn;
    const originalError = console.error;

    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Suppress source map warnings
      if (message.includes("Invalid source map") || message.includes("sourceMapURL")) {
        return;
      }
      
      // Suppress body size warnings
      if (message.includes("Request body exceeded") || message.includes("10MB")) {
        return;
      }
      
      // Suppress FormData parsing errors for page routes
      if (message.includes("Failed to parse body as FormData")) {
        return;
      }
      
      originalWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      
      // Suppress source map errors
      if (message.includes("Invalid source map") || message.includes("sourceMapURL")) {
        return;
      }
      
      // Suppress FormData parsing errors for page routes
      if (message.includes("Failed to parse body as FormData")) {
        return;
      }
      
      originalError.apply(console, args);
    };
  }
}
