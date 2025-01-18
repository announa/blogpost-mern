import { StorageToken } from './getToken';

export const saveTokenInLocalStorage = (token: StorageToken, type: 'accessToken' | 'refreshToken') => {
  const tokenCopy = { ...token, token: btoa(token.token) };
  localStorage.setItem(type, JSON.stringify(tokenCopy));
};
