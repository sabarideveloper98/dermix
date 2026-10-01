const getApiBase = () => {
  const hostname = window.location.hostname;

  // commend for this code to run live if u work local uncommend this code
  // if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
  //   return `${window.location.protocol}//${hostname}:5001`;
  // }
  return 'https://api.dermfix.in';
};

export const API_BASE = getApiBase();
export default API_BASE;