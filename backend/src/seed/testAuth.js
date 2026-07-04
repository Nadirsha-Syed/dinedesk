import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { registerSchema } from '../validators/auth.validator.js';

console.log('--- STARTING AUTH SECURITY TESTS ---');

// Test 1: Bcrypt Hashing and Comparison
async function testBcrypt() {
  const password = 'mySecurePassword123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log('Plaintext password:', password);
  console.log('Hashed password:', hash);

  const isMatch = await bcrypt.compare(password, hash);
  const isWrongMatch = await bcrypt.compare('wrongPassword', hash);

  if (isMatch && !isWrongMatch) {
    console.log('✅ Test 1: Bcrypt password hashing and verification works.');
  } else {
    throw new Error('Bcrypt password validation failed.');
  }
}

// Test 2: JWT Signing and Parsing
function testJWT() {
  const payload = { id: 'mock_user_id_123', role: 'customer' };
  const secret = 'my_test_secret_key';

  const token = jwt.sign(payload, secret, { expiresIn: '1h' });
  console.log('Generated JWT:', token);

  const decoded = jwt.verify(token, secret);

  if (decoded.id === payload.id && decoded.role === payload.role) {
    console.log('✅ Test 2: JWT token signing and decoding works.');
  } else {
    throw new Error('JWT verification failed.');
  }
}

// Test 3: Zod Schema validations
function testValidation() {
  const validUser = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
  };

  const invalidUser = {
    name: 'J',
    email: 'not-an-email',
    password: '',
  };

  const validResult = registerSchema.safeParse(validUser);
  const invalidResult = registerSchema.safeParse(invalidUser);

  if (validResult.success && !invalidResult.success) {
    console.log('✅ Test 3: Zod validation schemas work.');
  } else {
    throw new Error('Zod validation test failed.');
  }
}

async function runAll() {
  await testBcrypt();
  testJWT();
  testValidation();
  console.log('--- ALL AUTH SECURITY TESTS COMPLETED SUCCESSFULLY ---');
}

runAll().catch((err) => {
  console.error('❌ Test execution failed:', err.message);
  process.exit(1);
});
