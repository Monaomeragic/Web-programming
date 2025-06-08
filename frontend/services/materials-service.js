// frontend/services/materials-service.js

window.MaterialsService = window.MaterialsService || {};
MaterialsService.BASE_URL = Constants.PROJECT_BASE_URL + '/materials';

function getToken() {
  return localStorage.getItem('user_token');
}

function makeHeaders() {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
}

function handleResponse(response, onSuccess, onError) {
  if (response.ok) {
    response.json().then(data => onSuccess(data));
  } else {
    response.text().then(text => {
      let msg = text;
      try {
        const obj = JSON.parse(text);
        msg = obj.message || JSON.stringify(obj);
      } catch {}
      onError(msg);
    });
  }
}

/**
 * Fetch all materials, optionally filtered by subject_name.
 * @param {string|null} subjectName
 * @param {function} onSuccess callback receiving {status, data}
 * @param {function} onError callback receiving error message
 */
MaterialsService.getAll = function(subjectName, onSuccess, onError) {
  let url = MaterialsService.BASE_URL;
  if (subjectName) {
    url += '?subject_name=' + encodeURIComponent(subjectName);
  }
  fetch(url, {
    method: 'GET',
    headers: makeHeaders()
  })
    .then(res => handleResponse(res, onSuccess, onError))
    .catch(err => onError(err.message || err));
};

/**
 * Create a new material.
 * @param {string} subjectName
 * @param {object} materialData {material_title, file}
 * @param {function} onSuccess callback receiving {status, message}
 * @param {function} onError callback receiving error message
 */
MaterialsService.create = function(subjectName, materialData, onSuccess, onError) {
  let url = MaterialsService.BASE_URL;
  if (subjectName) {
    url += '/' + encodeURIComponent(subjectName);
  }
  const formData = new FormData();
  formData.append('material_title', materialData.material_title);
  if (materialData.file) {
    formData.append('file', materialData.file);
  }

  fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + getToken()
      // DO NOT set Content-Type here; the browser will set it automatically for FormData
    },
    body: formData
  })
    .then(res => handleResponse(res, onSuccess, onError))
    .catch(err => onError(err.message || err));
};

/**
 * Delete a material by ID.
 * @param {number|string} materialId
 * @param {function} onSuccess callback receiving {status, message}
 * @param {function} onError callback receiving error message
 */
MaterialsService.delete = function(materialId, onSuccess, onError) {
  fetch(MaterialsService.BASE_URL + '/' + materialId, {
    method: 'DELETE',
    headers: makeHeaders()
  })
    .then(res => handleResponse(res, onSuccess, onError))
    .catch(err => onError(err.message || err));
};