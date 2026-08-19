/**
 * Utility functions for frontend sanitization and validation.
 * Note: True protection against SQL Injection and XSS MUST happen on the backend.
 * These functions act purely as a defense-in-depth measure.
 */

export const sanitizeInput = (input: string): string => {
    if (!input) return "";
    
    // Remove common SQL injection characters: ', ", ;, --, /*, */
    let sanitized = input.replace(/['";]|--|\/\*|\*\//g, "");
    
    // Basic HTML tag stripping to prevent simple XSS
    sanitized = sanitized.replace(/<[^>]*>?/gm, "");
    
    return sanitized.trim();
  };
  
  export const validateName = (name: string): boolean => {
    // Only allow letters, spaces, hyphens, and apostrophes (for O'Connor, etc.)
    // Explicitly disallows numbers and dangerous symbols.
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(name) && name.length >= 2;
  };
  
  export const validateEmail = (email: string): boolean => {
    // Standard strict email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
