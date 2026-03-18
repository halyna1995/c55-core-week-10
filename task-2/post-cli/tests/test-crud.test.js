/**
 * Vitest tests for Complete CRUD Operations
 * Tests the trainee's complete implementation of all CRUD functions
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
const {
  createPost,
  createUser,
  deletePost,
  deleteUser,
  getMe,
  getPosts,
  setToken,
  updatePost,
} = services;

describe('Complete CRUD Operations', () => {
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

  it('should complete all CRUD operations successfully', async () => {
    const testUser = 'Alice';
    const testPassword = 'password123';
    const postText = 'My first test post!';
    const updatedText = 'Updated post text!';
    const postId = 1;

    // Mock CREATE user response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ user: testUser, token: 'jwt-token-abc' }),
    });

    // CREATE: Register a user
    let data = await createUser(testUser, testPassword);
    expect(data.user).toBe(testUser);
    expect(data.token).toBeDefined();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/users/register'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: testUser, password: testPassword }),
      })
    );

    // Set token for subsequent authenticated requests
    setToken(data.token);

    // Mock CREATE post response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ id: postId, user: testUser, text: postText }),
    });

    // CREATE: Create a post
    data = await createPost(postText);
    expect(data.id).toBe(postId);
    expect(data.text).toBe(postText);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/posts'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-abc',
        }),
        body: JSON.stringify({ text: postText }),
      })
    );

    // Mock READ posts response
    const mockPosts = [{ id: postId, text: postText, user: testUser }];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockPosts,
    });

    // READ: Get all posts
    data = await getPosts();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining('/posts/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-abc',
        }),
      })
    );

    // Mock UPDATE post response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: postId, text: updatedText }),
    });

    // UPDATE: Modify the post
    data = await updatePost(postId, updatedText);
    expect(data.id).toBe(postId);
    expect(data.text).toBe(updatedText);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining(`/posts/${postId}`),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-abc',
        }),
        body: JSON.stringify({ text: updatedText }),
      })
    );

    // Mock READ updated posts response
    const updatedPosts = [{ id: postId, text: updatedText, user: testUser }];
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => updatedPosts,
    });

    // READ: Verify the update
    data = await getPosts();
    const updatedPost = data.find((p) => p.id === postId);
    expect(updatedPost).toBeDefined();
    expect(updatedPost.text).toBe(updatedText);

    // Mock DELETE post response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, text: 'Updated post text!', message: 'Post deleted' }),
    });

    // DELETE: Remove the post
    await deletePost(postId);
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining(`/posts/${postId}`),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-abc',
        }),
      })
    );

    // Mock DELETE user response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: 'Alice', message: 'User deleted' }),
    });

    // DELETE: Remove the user
    await deleteUser();
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://postcentral.hyf.dev/users/me',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-abc',
        }),
      })
    );
  });

  it('should verify updatePost uses PUT method with Authorization', async () => {
    const postId = 42;
    const newText = 'Updated content';
    setToken('mock-jwt-token');

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: postId, text: newText }),
    });

    await updatePost(postId, newText);

    // Verify PUT request with correct URL, data, and auth header
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining(`/posts/${postId}`),
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-jwt-token',
        }),
        body: JSON.stringify({ text: newText }),
      })
    );
  });

  it('should verify deleteUser uses DELETE method with Authorization', async () => {
    setToken('mock-jwt-token');

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ user: 'mock-user', message: 'User deleted' }),
    });

    await deleteUser();

    // Verify DELETE request to correct endpoint with auth header
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
      })
    );
  });

  it('should verify deletePost uses DELETE method with Authorization', async () => {
    setToken('mock-jwt-token');

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 5, text: 'some text', message: 'Post deleted' }),
    });

    await deletePost(5);

    // Verify DELETE request with correct URL and auth header
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/posts/5'),
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
      })
    );
  });

  it('should verify getMe fetches current user info with Authorization', async () => {
    setToken('mock-jwt-token');
    const mockUser = { user: 'Alice' };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockUser,
    });

    const data = await getMe();

    expect(data).toEqual(mockUser);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/users/me'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
      })
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should handle errors in any CRUD operation', async () => {
    // Mock error response
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Server error' }),
    });

    // Verify any function throws error on API failure
    await expect(createUser('Test', 'pass')).rejects.toThrow();
  });
});