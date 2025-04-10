import bcrypt from 'bcrypt';
import { HTTPError } from '../../class/HTTPError';
import { GetUserIdInput } from '../../controllers/auth.controller';
import { PostgresUser } from '../../types';
import { pool } from '../postgres-db/postgresDb';

export const getUserFromDb = async ({ email, password }: GetUserIdInput) => {
  console.log('Retrieving user from DB');
  const result = await pool.query<PostgresUser>('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) {
    throw new HTTPError('Incorrect user name or password', 401);
  } else if (result.rows.length > 1) {
    throw new HTTPError('More than one user found for the provided login data', 401);
  }
  const user = result.rows[0];
  const { password: dbUserPassword, ...userData } = user;
  try {
    const passwordMatches = await bcrypt.compare(password, dbUserPassword);
    if (!passwordMatches) {
      throw new HTTPError('Incorrect user name or password', 401);
    }
    return userData;
  } catch (error) {
    throw new HTTPError('Incorrect user name or password', 401);
  }
};
