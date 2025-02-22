import bcrypt from 'bcrypt';
import { HTTPError } from '../../class/HTTPError';
import { GetUserIdInput, IUser } from '../../controllers/auth.controller';
import { User } from '../../models/user.model';

export const getUserFromDb = async ({ email, password }: GetUserIdInput) => {
  console.log('Retrieving user from DB');
  let user: IUser | null = null;
  const result = await User.find({ email: email }).lean();
  if (result.length === 0) {
    throw new HTTPError('Incorrect user name or password', 401);
  } else if (result.length > 1) {
    throw new HTTPError('More than one user found for the provided login data', 401);
  }
  user = result[0];
  const { password: dbUserPassword, _id, ...userData } = user;
  try {
    const passwordMatches = await bcrypt.compare(password, dbUserPassword);
    if (!passwordMatches) {
      throw new HTTPError('Incorrect user name or password', 401);
    }
    return { ...userData, id: _id };
  } catch (error) {
    console.error(error);
    throw new HTTPError('Incorrect user name or password', 401);
  }
};
