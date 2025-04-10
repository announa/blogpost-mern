import bcrypt from 'bcrypt';
import { HTTPError } from '../../class/HTTPError';
import { pool } from '../postgres-db/postgresDb';

export const storeRefreshToken = async (refreshToken: string, userId: number | string) => {
  const hashedToken = await bcrypt.hash(refreshToken, 10);
  const response = await pool.query(
    `INSERT INTO refresh_tokens (token, user_id)
    VALUES (ARRAY[$1], $2)
    ON CONFLICT (user_id)
    DO UPDATE SET token = array_append(refresh_tokens.token, $1)
    RETURNING *`,
    [hashedToken, userId]
  );
  const refreshTokensResponse = response.rows[0];
  if (!refreshTokensResponse || refreshTokensResponse.length === 0) {
    throw new HTTPError('An error occurred storing refresh token', 500);
  }
};

export const storeResetToken = async (resetToken: string, userId: string) => {
  const hashedToken = await bcrypt.hash(resetToken, 10);
  const response = await pool.query(
    `INSERT INTO reset_tokens (token, user_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE SET token = $1
    RETURNING *`,
    [hashedToken, userId]
  );
  const resetTokenResponse = response.rows[0];
  if (!resetTokenResponse || resetTokenResponse.length === 0) {
    throw new HTTPError('An error occurred storing reset token', 500);
  }
};
