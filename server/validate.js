const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Stored lowercase so the same address doesn't sign up twice in different cases
const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

const isValidEmail = (email) => EMAIL_RE.test(normalizeEmail(email));

module.exports = { normalizeEmail, isValidEmail };
