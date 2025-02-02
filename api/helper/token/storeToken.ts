import bcrypt from 'bcrypt';
import { ObjectId } from 'bson';
import { RefreshToken } from '../../models/refreshToken.model';
import { ResetToken } from '../../models/resetToken.model';

export const storeRefreshToken = async (refreshToken: string, userId: ObjectId) => {
  const hashedToken = await bcrypt.hash(refreshToken, 10);
  const existingUserTokens = await RefreshToken.findOne({ user: userId });
  if (existingUserTokens) {
    await RefreshToken.findByIdAndUpdate(
      existingUserTokens._id,
      { $push: { token: hashedToken } },
      { new: true }
    );
  } else {
    await RefreshToken.create({ user: userId, token: [hashedToken] });
  }
};

export const storeResetToken = async (resetToken: string, userId: ObjectId) => {
  const hashedResetToken = await bcrypt.hash(resetToken, 10)
  const existingUserTokens = await ResetToken.findOne({ user: userId });
  if (existingUserTokens) {
    await ResetToken.findByIdAndUpdate(existingUserTokens._id, { token: hashedResetToken }, { new: true });
  } else {
    await ResetToken.create({ user: userId, token: hashedResetToken });
  }
};
