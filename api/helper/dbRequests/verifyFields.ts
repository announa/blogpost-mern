import { HTTPError } from '../../class/HTTPError';
import { User } from '../../models/user.model';

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
  const result = await User.findOne({ [field]: value }, '_id');
  if (result) {
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
