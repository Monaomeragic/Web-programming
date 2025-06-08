// messages-service.js rewritten to use RestClient pattern similar to appointment-service.js

window.MessagesService = window.MessagesService || {};

const BASE_URL = 'http://localhost/MonaOmeragic/Web-programming/backend/messages';

function getToken() {
  return localStorage.getItem('user_token');
}

function makeHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
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

MessagesService.list = function(success, error) {
  fetch(BASE_URL, {
    method: 'GET',
    headers: makeHeaders()
  }).then(res => handleResponse(res, success, error))
    .catch(err => error(err.message || err));
};

MessagesService.create = function(data, success, error) {
  fetch(BASE_URL, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify(data)
  }).then(res => handleResponse(res, success, error))
    .catch(err => error(err.message || err));
};

MessagesService.delete = function(id, success, error) {
  fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: makeHeaders()
  }).then(res => handleResponse(res, success, error))
    .catch(err => error(err.message || err));
};

MessagesService.markAsRead = function(id, success, error) {
  fetch(`${BASE_URL}/${id}/read`, {
    method: 'POST',
    headers: makeHeaders()
  }).then(res => handleResponse(res, success, error))
    .catch(err => error(err.message || err));
};

// Optional: get messages between two users
MessagesService.getBetween = function(fromUserId, toUserId, success, error) {
  fetch(`${BASE_URL}/${fromUserId}/${toUserId}`, {
    method: 'GET',
    headers: makeHeaders()
  }).then(res => handleResponse(res, success, error))
    .catch(err => error(err.message || err));
};