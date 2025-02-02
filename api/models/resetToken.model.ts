import { model, Schema } from 'mongoose';

const ResetTokenModel = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ResetToken = model('ResetToken', ResetTokenModel);
