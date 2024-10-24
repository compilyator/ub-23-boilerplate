// unitTests.js
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../models/User');
const File = require('../models/File');

let server; // To store the server instance

// Connect to the testing database before running tests and start the server
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
  }
  server = app.listen(4000); // Start server on port 4000 for testing
});

// Clear test data after each test
afterEach(async () => {
  await User.deleteMany({});
  await File.deleteMany({});
});

// Disconnect from the database and close the server after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await server.close(); // Close the server
});

// Test Register Endpoint
describe('POST /register', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        username: 'testuser',
        password: 'password123',
      });
    
    expect(response.statusCode).toBe(302);
  });
});

// Test Login Endpoint
describe('POST /login', () => {
  it('should login a user with valid credentials', async () => {
    // Create a user for testing login
    const user = new User({ username: 'testuser', password: await bcrypt.hash('password123', 10) });
    await user.save();

    const response = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should not login a user with invalid credentials', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        username: 'wronguser',
        password: 'wrongpassword',
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('Invalid credentials');
  });
});

// Test File Upload Endpoint
describe('POST /upload', () => {
  it('should upload a file for an authenticated user', async () => {
    // Create a user and login to get a token
    const user = new User({ username: 'testuser', password: await bcrypt.hash('password123', 10) });
    await user.save();

    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    const token = loginResponse.headers['set-cookie'][0].split(';')[0];

    const response = await request(app)
      .post('/upload')
      .set('Cookie', token)
      .attach('file', Buffer.from('test file content'), 'testfile.txt');

    expect(response.statusCode).toBe(302); // Redirects to /files after upload
  });
});

// Test File Download Endpoint
describe('GET /download/:filename', () => {
  it('should upload and then download a file for an authenticated user', async () => {
    // Create a user and login to get a token
    const user = new User({ username: 'testuser', password: await bcrypt.hash('password123', 10) });
    await user.save();

    const loginResponse = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: 'password123',
      });

    const token = loginResponse.headers['set-cookie'][0].split(';')[0];

    // Upload a file
    const uploadResponse = await request(app)
      .post('/upload')
      .set('Cookie', token)
      .attach('file', Buffer.from('test file content'), 'testfile.txt');

    expect(uploadResponse.statusCode).toBe(302); // Redirects to /files after upload

    // Download the uploaded file
    const file = await File.findOne({ userId: user._id });

    const response = await request(app)
      .get(`/download/${file.filename}`)
      .set('Cookie', token);

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-disposition']).toContain('attachment');
  });
});
