const getApiBase = () => {
  const hostname = window.location.hostname;
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${hostname}:5001`;
  }
  return 'http://localhost:5001';
};

export const API_BASE = getApiBase();
export default API_BASE;
