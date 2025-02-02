export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*+?&()"#^-])[A-Za-z\d@$!%*+?&()"#^-]{8,}$/;

export const initialUserData = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: '',
  repeatPassword: '',
};

export type UserErrorMessages = typeof userErrorMessages;

export const userErrorMessages = {
  firstName: 'First name is required',
  lastName: 'Last name is required',
  userName: 'User name is required',
  email: 'A valid email is required',
  password:
    'Invalid password. The password must contain at least 8 characters with at least one lower case and one upper case letter, one number and one special character @$!%*+?&()"#^-',
  repeatPassword: 'Must be the same as password',
};
