// frontend/utils/constant.js
window.Constants = {
  PROJECT_BASE_URL:
    window.location.hostname === "localhost"
      ? "http://localhost/MonaOmeragic/Web-programming/backend"
      : "https://whale-app-2-rytvu.ondigitalocean.app/backend",
  USER_ROLE: "student",
  ADMIN_ROLE: "admin",
  PROFESSOR_ROLE: "professor",
  ASSISTANT_ROLE: "assistant"
};

var Constants = window.Constants;