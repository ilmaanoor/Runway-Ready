// Simple API Service for connecting React frontend to Flask SQLite backend
const BASE_URL = 'http://127.0.0.1:5000/api';

export const get = async (endpoint) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    return res.ok ? await res.json() : null;
  } catch (err) {
    return null;
  }
};

export const post = async (endpoint, data = {}) => {
  try {
    const formData = new FormData();
    for (const key in data) {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    return null;
  }
};

export const del = async (endpoint, data = {}) => {
  try {
    let query = '';
    const params = [];
    for (const key in data) {
      if (data[key]) {
        params.push(`${key}=${encodeURIComponent(data[key])}`);
      }
    }
    if (params.length > 0) {
      query = '?' + params.join('&');
    }
    const res = await fetch(`${BASE_URL}${endpoint}${query}`, {
      method: 'DELETE'
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    return null;
  }
};
