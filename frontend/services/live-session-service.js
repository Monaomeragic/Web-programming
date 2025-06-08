window.LiveSessionService = window.LiveSessionService || {};
// live-session-service.js follows the RestClient pattern similar to messages-service.js
LiveSessionService.BASE_URL = Constants.PROJECT_BASE_URL + "/live_sessions";

function getToken() {
  return localStorage.getItem('user_token');
}

function makeHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token,
    'Authentication': token
  };
}

function handleResponse(response, success, error) {
  if (response.ok) {
    response.json().then(success);
  } else {
    response.text().then(text => {
      try {
        const errObj = JSON.parse(text);
        error(errObj.error || text);
      } catch {
        error(text);
      }
    });
  }
}

// Fetch all upcoming live sessions
LiveSessionService.list = function(success, error) {
  fetch(LiveSessionService.BASE_URL, {
    method: 'GET',
    headers: makeHeaders()
  })
  .then(res => handleResponse(res, success, error))
  .catch(err => error(err.message || err));
};

// Create a new live session (professor only)
LiveSessionService.create = function(data, success, error) {
  fetch(LiveSessionService.BASE_URL, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify(data)
  })
  .then(res => handleResponse(res, success, error))
  .catch(err => error(err.message || err));
};

// Student RSVPs to a session
LiveSessionService.attend = function(sessionId, success, error) {
  fetch(`${LiveSessionService.BASE_URL}/${sessionId}/attend`, {
    method: 'POST',
    headers: makeHeaders()
  })
  .then(res => handleResponse(res, success, error))
  .catch(err => error(err.message || err));
};

// Professor fetches attendees for a session
LiveSessionService.getAttendees = function(sessionId, success, error) {
  fetch(`${LiveSessionService.BASE_URL}/${sessionId}/attendees`, {
    method: 'GET',
    headers: makeHeaders()
  })
  .then(res => handleResponse(res, success, error))
  .catch(err => error(err.message || err));
};