import { HTTPError } from '../../class/HTTPError';
import { pool } from '../postgres-db/postgresDb';

const fieldName = {
  firstName: 'first name',
  lastName: 'last name',
  userName: 'user name',
  email: 'email',
  password: 'password',
};

type VerifyFieldKeys = keyof typeof fieldName;

export type VerifyFieldsInput = Partial<Record<VerifyFieldKeys, string>>;

const verifyIfExists = async (field: VerifyFieldKeys, value: string) => {
  const formattedField = field.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  const response = await pool.query(`SELECT id FROM users WHERE $1 = $2`, [formattedField, value]);
  if (response.rows[0]) {
    throw new HTTPError(`A user with the provided ${fieldName[field]} already exists`, 400);
  }
};

export const verifyFields = async (input: VerifyFieldsInput) => {
  const fields = Object.keys(input) as VerifyFieldKeys[];
  if (fields.length === 0) {
    return;
  }

  await Promise.all(
    fields.map((field) => {
      const value = input[field];
      if (value) {
        return verifyIfExists(field, value);
      }
    })
  );
};
