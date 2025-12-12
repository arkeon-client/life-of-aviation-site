// src/lib/constants.js

// Read from Environment Variable and split into an array
const adminString = import.meta.env.PUBLIC_ADMIN_EMAILS || '';

export const ADMIN_EMAILS = adminString.split(',').map(email => email.trim());