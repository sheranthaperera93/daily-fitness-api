const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const axios = require('axios');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Verify code and return code doc (or throw an error if it is not valid)
 * @param {string} userId
 * @param {string} code
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyCode = async (userId, code, type) => {
  const tokenDoc = await Token.findOne({ token: code, type, user: userId, blacklisted: false });
  if (!tokenDoc) {
    throw new Error('Token not found');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);
  await saveToken(refreshToken, user.id, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  await saveToken(resetPasswordToken, user.id, expires, tokenTypes.RESET_PASSWORD);
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  await saveToken(verifyEmailToken, user.id, expires, tokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

/**
 * Find OTP verification code
 * @param {String} userId
 * @returns {Promise<string>}
 */
const findVerifyOtpToken = async (userId) => {
  const tokenDoc = await Token.findOne({ user: userId, type: tokenTypes.VERIFY_OTP });
  return tokenDoc;
};

/**
 * Update OTP verification code
 * @param {String} userId
 * @param {String} token
 * @returns {Promise<string>}
 */
const updateVerifyOtpToken = async (userId, token) => {
  const tokenDoc = await Token.updateOne({ user: userId, type: tokenTypes.VERIFY_OTP }, { token });
  return tokenDoc;
};

/**
 * Generate OTP verification code
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateUserVerifyOTP = async (user) => {
  const expires = moment().add(config.jwt.verifiyUserOTPExpirationMinutes, 'minutes');
  const verifyUserOtp = Math.floor(100000 + Math.random() * 900000);
  const isExist = await findVerifyOtpToken(user.id);
  if (isExist) {
    await updateVerifyOtpToken(user.id, verifyUserOtp);
  } else {
    await saveToken(verifyUserOtp, user.id, expires, tokenTypes.VERIFY_OTP);
  }
  return verifyUserOtp;
};

/**
 * Verify google access token and return user info
 * @param {string} accessToken
 * @returns {Promise<string>}
 */
const verifyGoogleToken = async (accessToken) => {
  const res = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
  if (res.status === httpStatus.OK) {
    return res.data;
  }
  throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Google access token verification failed');
};

module.exports = {
  generateToken,
  saveToken,
  verifyCode,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateUserVerifyOTP,
  verifyGoogleToken,
};
