// Change base URL for API requests to the local IP of the Post Central API server
//const BASE_URL = 'https://postcentral.hyf.dev';
const BASE_URL = 'https://postcentral.hyf.dev';

// ============================================================================
// AUTH TOKEN - Stored after login/register, sent with every request
// ============================================================================

/**
 * The JWT token received from login or register.
 * This token proves who you are to the server.
 */
let authToken = null;

/**
 * Save the token. Called by the UI after login/register and by unit tests.
 */
const setToken = (token) => {
  authToken = token;
};

/**
 * Get the current token. Use this to build the Authorization header
 * for authenticated requests: `Bearer ${getToken()}`
 */
const getToken = () => authToken;

// ============================================================================
// HELLO ENDPOINT - Already implemented! Read this as a reference for your code.
// ============================================================================

/**
 * Get a hello message from Post Central
 * Method: GET | Endpoint: /posts/hello | Auth: No
 * Response: { id: number, user: string, text: string, timestamp: string }
 */
const getHello = async () => {
  const response = await fetch(`${BASE_URL}/posts/hello`);
  if (!response.ok) {
    throw new Error(
      `Failed to get hello: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

// ============================================================================
// STAGE 1: GET REQUEST - Read data from the server
// ============================================================================

/**
 * Get current user information
 * Method: GET | Endpoint: /users/me | Auth: Yes
 * Response: { user: string }
 */
const getMe = async () => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to get user info: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

// ============================================================================
// STAGE 2: POST REQUEST - createUser() is provided as a reference. Implement loginUser().
// ============================================================================

/**
 * Register a new user
 * Method: POST | Endpoint: /users/register | Auth: No
 * Body: { name, password }
 * Response: { user: string, token: string }
 */
const createUser = async (name, password) => {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, password }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to create user: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

/**
 * Log in an existing user
 * Method: POST | Endpoint: /users/login | Auth: No
 * Body: { name, password }
 * Response: { user: string, token: string }
 */
const loginUser = async (name, password) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to login: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

// ============================================================================
// STAGE 3: More CRUD Operations
// ============================================================================

/**
 * Create a new post
 * Method: POST | Endpoint: /posts | Auth: Yes
 * Body: { text }
 * Response: { id: number, text: string, user: string }
 */
const createPost = async (text) => {
  const response = await fetch(`${BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to create post: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json(); 
};

/**
 * Get all posts for the current user
 * Method: GET | Endpoint: /posts/me | Auth: Yes
 * Response: Array of { id, text, user }
 */
const getPosts = async () => {
  const response = await fetch(`${BASE_URL}/posts/me`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  }); 
  if (!response.ok) {
    throw new Error(
      `Failed to get posts: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

/**
 * Update an existing post
 * Method: PUT | Endpoint: /posts/:id | Auth: Yes
 * Body: { text }
 * Response: { id: number, text: string }
 */
const updatePost = async (id, text) => {
  const response = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ text }), 
});
  if (!response.ok) {
    throw new Error(
      `Failed to update post: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};


/**
 * Delete current user
 * Method: DELETE | Endpoint: /users/me | Auth: Yes
 * Response: { user: string, message: string }
 */
const deleteUser = async () => {
  const response = await fetch(`${BASE_URL}/users/me`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to delete user: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

/**
 * Delete a post
 * Method: DELETE | Endpoint: /posts/:id | Auth: Yes
 * Response: { id: number, text: string, message: string }
 */
const deletePost = async (id) => {
  const response = await fetch(`${BASE_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to delete post: HTTP ${response.status} ${response.statusText}`
    );
  }
  return await response.json();
};

// ============================================================================
// EXPORTS - Make functions available for testing and main.js
// ============================================================================

export {
  createPost,
  createUser,
  deletePost,
  deleteUser,
  getHello,
  getMe,
  getPosts,
  getToken,
  loginUser,
  setToken,
  updatePost,
};
