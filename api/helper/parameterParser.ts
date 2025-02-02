import { z } from 'zod';
import validator from 'validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*+?&()"#^-])[A-Za-z\d@$!%*+?&()"#^-]{8,}$/;

export const loginInputParser = z.object({
  email: z.string().refine((value) => validator.isEmail(value), { message: 'A valid email is required' }),
  password: z.string().nonempty({ message: 'Password is required' }),
});

export const registerInputParser = z.object({
  firstName: z.string().nonempty({ message: 'First name is required' }),
  lastName: z.string().nonempty({ message: 'Last name is required' }),
  userName: z.string().nonempty({ message: 'User name is required' }),
  email: z.string().refine((value) => validator.isEmail(value), { message: 'A valid email is required' }),
  password: z
    .string()
    .nonempty({ message: 'Password is required' })
    .refine((password) => PASSWORD_REGEX.test(password), 'Invalid password'),
});

export const passwordParser = z
  .string()
  .nonempty({ message: 'Password is required' })
  .refine((password) => PASSWORD_REGEX.test(password), 'Invalid password');

export const updateUserInputParser = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  userName: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((value) => !value || validator.isEmail(value), { message: 'A valid email is required' }),
  password: z
    .string()
    .optional()
    .refine((password) => !password || PASSWORD_REGEX.test(password), 'Invalid password'),
});
