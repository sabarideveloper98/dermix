// const getApiBase = () => {
//   const hostname = window.location.hostname;

//   // commend for this code to run live if u work local uncommend this code
//   // if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
//   //   return `${window.location.protocol}//${hostname}:5001`;
//   // }
//   return 'https://api.dermfix.in';
// };

const getApiBase = () => {
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }

  return 'https://api.dermfix.in/api';
};

export const API_BASE = getApiBase();
export const API_BASE_URL = API_BASE;

export default API_BASE;