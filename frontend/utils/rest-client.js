if (typeof window.Constants === 'undefined') {
  window.Constants = {
    PROJECT_BASE_URL:
      window.location.hostname === "localhost"
        ? "http://localhost/MonaOmeragic/Web-programming/backend"
        : "https://whale-app-2-rytvu.ondigitalocean.app"
  };
}

window.RestClient = {
    request(url, method, data, success, failure) {
      // ... rest of your code stays the same!
    },
    get(url,  success, failure) { this.request(url, "GET",    null,        success, failure); },
    post(url, data, success, failure) { this.request(url, "POST",   data,       success, failure); },
    patch(url, data, success, failure) { this.request(url, "PATCH",  data,      success, failure); },
    put(url, data, success, failure) { this.request(url, "PUT",    data,       success, failure); },
    delete(url, data, success, failure) { this.request(url, "DELETE", data,       success, failure); }
};