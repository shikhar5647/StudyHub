const crypto = require('crypto');

async function issueAuthTokens(user) {
  const accessToken = user.generateAccessToken();
  const refreshToken = crypto.randomBytes(40).toString('hex');
  await user.addRefreshToken(refreshToken);

  user.lastLogin = new Date();
  await user.save();

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  return { user: userResponse, accessToken, refreshToken };
}

module.exports = { issueAuthTokens };
