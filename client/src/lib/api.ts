// API configuration for different environments
export const API_BASE_URL = (() => {
  // Always use relative URLs for both development and production
  // This ensures that API calls work on any domain (Replit, custom domain, etc.)
  return '';
})();

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  SIGNUP: `${API_BASE_URL}/api/signup`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  // Add other endpoints as needed
};

// Helper function for making API requests with proper error handling
export async function makeApiRequest(endpoint: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(endpoint, { ...defaultOptions, ...options });
    
    // Handle network errors
    if (!response.ok) {
      let errorMessage = 'Request failed';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    // Handle network connection errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }
    
    // Re-throw other errors
    throw error;
  }
}