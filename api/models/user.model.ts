import { model, Schema } from 'mongoose';

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
  },
  userName: {
    type: String,
    required: [true, 'Please provide a user name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide an password'],
  },
});

export const User = model('User', UserSchema);
