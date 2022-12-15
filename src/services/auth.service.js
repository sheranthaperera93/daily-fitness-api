const httpStatus = require('http-status');
const generator = require('generate-password');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { userTypes, userRanks } = require('../config/users');

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<user> | ApiError}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  if (!user.isEmailVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not verified');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    return await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

/**
 * Verify code
 * @param {string} verifyUserId
 * @param {string} verifyUserCode
 * @returns {Promise}
 */
const verifyCode = async (verifyUserId, verifyUserCode) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyCode(verifyUserId, verifyUserCode, tokenTypes.VERIFY_OTP);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_OTP });
    const newUser = await userService.updateUserById(user.id, { isEmailVerified: true });
    return newUser;
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User verification failed');
  }
};

/**
 * Verify google token
 * @param {string} accessToken
 * @returns {Promise}
 */
const verifyGoogleToken = async (accessToken) => {
  try {
    const googleUserInfo = await tokenService.verifyGoogleToken(accessToken);
    const generatedPassword = generator.generate({
      length: 10,
      numbers: true,
    });
    const userData = {
      name: googleUserInfo.name,
      firstName: googleUserInfo.given_name,
      lastName: googleUserInfo.family_name,
      pictureUrl: googleUserInfo.picture,
      email: googleUserInfo.email,
      type: userTypes.GOOGLE,
      password: generatedPassword,
      isEmailVerified: googleUserInfo.email_verified,
      rank: userRanks.BEGINER,
    };
    return userData;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Google verification failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  verifyCode,
  verifyGoogleToken,
};
