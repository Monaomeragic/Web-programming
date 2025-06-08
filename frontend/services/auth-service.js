

const AuthService = (() => {
  const BASE_URL = Constants.PROJECT_BASE_URL;

  // Save token to localStorage
  function saveToken(token) {
    localStorage.setItem('jwt_token', token);
  }

  // Get token from localStorage
  function getToken() {
    return localStorage.getItem('jwt_token');
  }

  // Remove token on logout
  function clearToken() {
    localStorage.removeItem('jwt_token');
  }

  // Login function
  async function login(email, password) {
    try {
      const response = await $.ajax({
        url: `${BASE_URL}/auth/login`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
      });
      if (response && response.token) {
        saveToken(response.token);
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout function
  function logout() {
    clearToken();
    // Any other logout logic here
  }

  // Register function (example)
  async function register(userData) {
    try {
      const response = await $.ajax({
        url: `${BASE_URL}/auth/register`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(userData),
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  return {
    login,
    logout,
    register,
    getToken,
    clearToken,
  };
})();