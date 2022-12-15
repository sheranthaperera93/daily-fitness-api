const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const code = await tokenService.generateUserVerifyOTP(user);
  await emailService.sendUserVerificationCode(user.email, code);
  res.status(httpStatus.CREATED).send({ user });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.query.token);
  res.status(httpStatus.OK).send({ user });
});

const verifyCode = catchAsync(async (req, res) => {
  const user = await authService.verifyCode(req.body.user_id, req.body.code);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.OK).send({ user, tokens });
});

const verifyGoogleToken = catchAsync(async (req, res) => {
  const googleUser = await authService.verifyGoogleToken(req.body.accessToken, req.body.register);
  let user = null;
  if (req.body.register) {
    // Create new user
    user = await userService.createUser(googleUser);
  } else {
    user = await userService.getUserByEmail(googleUser.email);
    if (!user) {
      res.status(httpStatus.NOT_FOUND).send({ status: 'USER_NOT_FOUND', data: '', attribute: '' });
    }
  }
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  verifyCode,
  verifyGoogleToken,
};
