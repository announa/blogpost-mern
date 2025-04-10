import { ClientUser, PostgresUser } from '../../types';

export const mapUserData = (user: Partial<PostgresUser>): Partial<ClientUser> => {
  const entries = Object.entries(user) as [keyof PostgresUser, string | number][];
  const mappedKeyValues = entries.map((entry) => {
    const key = entry[0];
    const value = entry[1];
    switch (key) {
      case 'first_name':
        return ['firstName', value];
      case 'last_name':
        return ['lastName', value];
      case 'user_name':
        return ['userName', value];
      default:
        return [[key], value];
    }
  });
  const mappedUser = Object.fromEntries(mappedKeyValues);
  return mappedUser as Partial<ClientUser>;
};
