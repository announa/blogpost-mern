export type TokenType = 'accessToken' | 'refreshToken';

export type StorageToken = {
  token: string;
  expiration: number;
};

export const useLocalStorage = () => {
  const removeStorageData = (type?: TokenType) => {
    if (type) {
      localStorage.removeItem(type);
    } else {
      localStorage.clear();
    }
  };

  const getStorageItem = (type: TokenType) => {
    try {
      const storageItem = localStorage.getItem(type);
      if (!storageItem) {
        return null;
      }
      const token: StorageToken = JSON.parse(storageItem);
      return token;
    } catch {
      return null;
    }
  };

  const getTokenFromLocalStorage = (type: TokenType): StorageToken | null => {
    try {
      const storageToken = getStorageItem(type);
      const expiration = storageToken?.expiration;
      const now = Date.now();
      if (!storageToken) {
        return null;
      }
      if (!expiration || expiration < now) {
        removeStorageData(type);
        return null;
      } else {
        return storageToken;
      }
    } catch {
      return null;
    }
  };

  return { getStorageItem, getTokenFromLocalStorage, removeStorageData };
};
