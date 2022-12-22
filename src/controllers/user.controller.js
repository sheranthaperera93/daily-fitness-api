const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const config = require('../config/config');
const { userRanks, userTypes } = require('../config/users');

const createUser = catchAsync(async (req, res) => {
  const body = {
    pictureUrl: req.body.pictureUrl ? req.body.pictureUrl : `${config.public_url}/user/default_user.png`,
    type: userTypes.EMAIL,
    isEmailVerified: false,
    rank: userRanks.BEGINER,
    name: req.body.name ? req.body.name : `${req.body.firstName} ${req.body.lastName}`,
    ...req.body,
  };
  const user = await userService.createUser(body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
