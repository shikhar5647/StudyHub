// backend/test/setup.js
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES = '15m';

// Increase timeout for tests
jest.setTimeout(30000);
