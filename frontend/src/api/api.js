import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // thanks to the proxy, this will go to http://localhost:5000/api
});

// Automatically add token to headers if logged in
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    config.headers.Authorization = `Bearer ${JSON.parse(userInfo).token}`;
  }
  return config;
});

export default API;
