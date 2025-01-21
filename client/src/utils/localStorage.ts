import { StorageToken, TokenType } from '../hooks/useToken';

export const saveTokenInLocalStorage = (token: StorageToken, type: TokenType) => {
  const tokenCopy = { ...token, token: btoa(token.token) };
  localStorage.setItem(type, JSON.stringify(tokenCopy));
};
