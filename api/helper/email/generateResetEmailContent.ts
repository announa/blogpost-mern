export const generateResetEmailContent = (resetToken: string, userId: string) => {
  const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}/${userId}`;
  const emailContent = `<h1>Reset password for blogpost @annaludewig.net</h1>
  <p>This email contains a link for resetting your password. If you did not request this email, please ignore it.</p>
  <p><a href=${resetPasswordUrl} target="_blank">${resetPasswordUrl}</a></br>`;
  return emailContent;
};
