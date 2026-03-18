/**
 * Vitest tests for POST request functions
 * Tests the trainee's implementation of createUser(), loginUser(), and createPost()
 *
 * Uses mocked fetch to verify trainees are making correct API calls
 * without requiring a running API server.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import fetcher functions
let services;
try {
  services = await import('../src/services.solution.js');
} catch {
  services = await import('../src/services.js');
}
const { createPost, createUser, loginUser, setToken } = services;

describe('POST Functions', () => {
  let fetchMock;

  beforeEach(() => {
    // Mock the global fetch function before each test
    fetchMock = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    // Restore the original fetch after each test
    vi.restoreAllMocks();
    setToken(null);
  });

  describe('createUser()', () => {
    it('should make POST request to /users/register with correct data', async () => {
      const testName = 'Alice';
      const testPassword = 'testpass123';

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ user: testName, token: 'jwt-token-abc' }),
      });

      await createUser(testName, testPassword);

      // Verify fetch was called with correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://postcentral.hyf.dev/users/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: testName, password: testPassword }),
        }
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should return user data with correct structure', async () => {
      const testName = 'Alice';
      const mockData = { user: testName, token: 'jwt-token-abc' };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const data = await createUser(testName, 'testpass123');

      // Verify the function returns the expected data structure
      expect(data).toBeDefined();
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('token');
      expect(data.user).toBe(testName);
      expect(typeof data.token).toBe('string');
    });

    it('should include Content-Type header', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ user: 'Alice', token: 'jwt-token-abc' }),
      });

      await createUser('Alice', 'testpass123');

      // Check that headers include Content-Type
      const callArgs = fetchMock.mock.calls[0][1];
      expect(callArgs.headers).toHaveProperty('Content-Type');
      expect(callArgs.headers['Content-Type']).toBe('application/json');
    });

    it('should throw error when API returns error', async () => {
      // Mock 400 response (bad request)
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Name is required' }),
      });

      // Verify the function throws an error
      await expect(createUser('', '')).rejects.toThrow();
    });
  });

  describe('loginUser()', () => {
    it('should make POST request to /users/login with correct data', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: 'Alice', token: 'jwt-token-xyz' }),
      });

      await loginUser('Alice', 'password123');

      // Verify fetch was called with correct parameters
      expect(fetchMock).toHaveBeenCalledWith(
        'https://postcentral.hyf.dev/users/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: 'Alice', password: 'password123' }),
        }
      );
    });

    it('should return user data with token', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ user: 'Alice', token: 'jwt-token-xyz' }),
      });

      const data = await loginUser('Alice', 'password123');

      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('token');
      expect(data.user).toBe('Alice');
    });

    it('should throw error on invalid credentials', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(loginUser('Alice', 'wrongpass')).rejects.toThrow();
    });
  });

  describe('createPost()', () => {
    beforeEach(() => {
      // Set token for authenticated requests
      setToken('mock-jwt-token');
    });

    it('should make POST request to /posts with correct data and Authorization header', async () => {
      const postText = 'My test post!';

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, text: postText, user: 'Alice' }),
      });

      await createPost(postText);

      // Verify fetch was called with correct parameters including auth header
      expect(fetchMock).toHaveBeenCalledWith('https://postcentral.hyf.dev/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-jwt-token',
        },
        body: JSON.stringify({ text: postText }),
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should return post data with correct structure', async () => {
      const postText = 'My test post!';
      const mockData = { id: 1, text: postText, user: 'Alice' };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockData,
      });

      const data = await createPost(postText);

      // Verify the function returns the expected data structure
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('text');
      expect(data).toHaveProperty('user');
      expect(data.text).toBe(postText);
      expect(data.user).toBe('Alice');
      expect(typeof data.id).toBe('number');
    });

    it('should include Content-Type and Authorization headers', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 1, text: 'Test', user: 'Alice' }),
      });

      await createPost('Test');

      // Check that headers include both Content-Type and Authorization
      const callArgs = fetchMock.mock.calls[0][1];
      expect(callArgs.headers).toHaveProperty('Content-Type');
      expect(callArgs.headers['Content-Type']).toBe('application/json');
      expect(callArgs.headers).toHaveProperty('Authorization');
      expect(callArgs.headers['Authorization']).toBe('Bearer mock-jwt-token');
    });

    it('should throw error when not authenticated', async () => {
      // Mock 401 response (unauthorized - no token)
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Token required' }),
      });

      // Verify the function throws an error
      await expect(createPost('Test post')).rejects.toThrow();
    });
  });
});
