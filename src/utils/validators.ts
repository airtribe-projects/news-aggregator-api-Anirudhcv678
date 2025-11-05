/**
 * Validation utility functions for input validation
 */

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns ValidationResult with isValid flag and error message if invalid
 */
export function validateEmail(email: any): ValidationResult {
    if (typeof email !== 'string') {
        return { isValid: false, error: 'Email must be a string' };
    }

    if (!email || email.trim().length === 0) {
        return { isValid: false, error: 'Email is required' };
    }

    // Basic email format validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return { isValid: false, error: 'Invalid email format' };
    }

    // Email length validation (RFC 5321)
    if (email.length > 254) {
        return { isValid: false, error: 'Email address is too long (maximum 254 characters)' };
    }

    return { isValid: true };
}

/**
 * Validates password strength and length
 * @param password - Password string to validate
 * @param minLength - Minimum password length (default: 8)
 * @returns ValidationResult with isValid flag and error message if invalid
 */
export function validatePassword(password: any, minLength: number = 8): ValidationResult {
    if (typeof password !== 'string') {
        return { isValid: false, error: 'Password must be a string' };
    }

    if (!password || password.length === 0) {
        return { isValid: false, error: 'Password is required' };
    }

    if (password.length < minLength) {
        return { isValid: false, error: `Password must be at least ${minLength} characters long` };
    }

    // Maximum password length for security
    if (password.length > 128) {
        return { isValid: false, error: 'Password is too long (maximum 128 characters)' };
    }

    return { isValid: true };
}

/**
 * Validates name field
 * @param name - Name string to validate
 * @returns ValidationResult with isValid flag and error message if invalid
 */
export function validateName(name: any): ValidationResult {
    if (typeof name !== 'string') {
        return { isValid: false, error: 'Name must be a string' };
    }

    if (!name || name.trim().length === 0) {
        return { isValid: false, error: 'Name is required' };
    }

    if (name.trim().length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters long' };
    }

    if (name.length > 100) {
        return { isValid: false, error: 'Name is too long (maximum 100 characters)' };
    }

    return { isValid: true };
}

/**
 * Validates preferences array
 * @param preferences - Preferences array to validate
 * @returns ValidationResult with isValid flag and error message if invalid
 */
export function validatePreferences(preferences: any): ValidationResult {
    if (!Array.isArray(preferences)) {
        return { isValid: false, error: 'Preferences must be an array' };
    }

    // Check if all elements are strings
    for (let i = 0; i < preferences.length; i++) {
        if (typeof preferences[i] !== 'string') {
            return { isValid: false, error: `Preferences[${i}] must be a string` };
        }

        if (preferences[i].trim().length === 0) {
            return { isValid: false, error: `Preferences[${i}] cannot be empty` };
        }

        // Maximum length for each preference
        if (preferences[i].length > 50) {
            return { isValid: false, error: `Preferences[${i}] is too long (maximum 50 characters)` };
        }
    }

    // Maximum number of preferences
    if (preferences.length > 20) {
        return { isValid: false, error: 'Maximum 20 preferences allowed' };
    }

    return { isValid: true };
}

/**
 * Validates that required fields are present and not empty
 * @param data - Object containing the data to validate
 * @param requiredFields - Array of required field names
 * @returns ValidationResult with isValid flag and error message if invalid
 */
export function validateRequiredFields(data: any, requiredFields: string[]): ValidationResult {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Request body must be an object' };
    }

    for (const field of requiredFields) {
        if (!(field in data) || data[field] === null || data[field] === undefined) {
            return { isValid: false, error: `${field} is required` };
        }
    }

    return { isValid: true };
}

/**
 * Validates field types match expected types
 * @param data - Object containing the data to validate
 * @param fieldTypes - Object mapping field names to expected types ('string', 'number', 'boolean', 'array')
 * @returns ValidationResult with isValid flag and error message if invalid
 */
export function validateFieldTypes(data: any, fieldTypes: Record<string, string>): ValidationResult {
    if (!data || typeof data !== 'object') {
        return { isValid: false, error: 'Request body must be an object' };
    }

    for (const [field, expectedType] of Object.entries(fieldTypes)) {
        if (field in data && data[field] !== null && data[field] !== undefined) {
            const actualType = Array.isArray(data[field]) ? 'array' : typeof data[field];
            if (actualType !== expectedType) {
                return { isValid: false, error: `${field} must be of type ${expectedType}` };
            }
        }
    }

    return { isValid: true };
}

