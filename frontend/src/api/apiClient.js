const BASE_URL = '/api';

/**
 * Common API client for all backend requests.
 * Automatically attaches the JWT token from localStorage if it exists.
 */
export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle 401 Unauthorized globally (e.g., token expired)
    if (response.status === 401) {
      console.warn('Unauthorized! Redirecting or clearing session...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      // window.location.href = '/login'; // Optional: auto-logout
    }
    
    const error = new Error(data.message || 'Something went wrong');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

apiClient.get = (endpoint, options = {}) => 
  apiClient(endpoint, { ...options, method: 'GET' });

apiClient.post = (endpoint, body, options = {}) => 
  apiClient(endpoint, { 
    ...options, 
    method: 'POST', 
    body: typeof body === 'string' ? body : JSON.stringify(body) 
  });

apiClient.put = (endpoint, body, options = {}) => 
  apiClient(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: typeof body === 'string' ? body : JSON.stringify(body) 
  });

apiClient.patch = (endpoint, body, options = {}) => 
  apiClient(endpoint, { 
    ...options, 
    method: 'PATCH', 
    body: typeof body === 'string' ? body : JSON.stringify(body) 
  });

apiClient.delete = (endpoint, options = {}) => 
  apiClient(endpoint, { ...options, method: 'DELETE' });
