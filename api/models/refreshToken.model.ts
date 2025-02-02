import { model, Schema } from 'mongoose';

const RefreshTokenModel = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: [String],
    required: true,
  },
});

export const RefreshToken = model('RefreshToken', RefreshTokenModel);
