const httpStatus = require('http-status');
const pick = require('../utils/pick');
const like = require('../utils/like');
const catchAsync = require('../utils/catchAsync');
const { workoutService } = require('../services');
const config = require('../config/config');

const createWorkout = catchAsync(async (req, res) => {
  const body = {
    pictureUrl: req.body.pictureUrl ? req.body.pictureUrl : `${config.public_url}/workouts/default_workout.png`,
    userId: process.env.userId,
    ...req.body,
  };
  const workout = await workoutService.createWorkout(body);
  res.status(httpStatus.CREATED).send(workout);
});

const getWorkouts = catchAsync(async (req, res) => {
  const queries = {
    userId: process.env.userId,
    ...req.query,
  };
  const likeFilter = like(queries, ['name']);
  const filter = pick(queries, ['userId', 'group']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await workoutService.queryWorkouts({ ...filter, ...likeFilter }, options);
  res.send(result);
});

module.exports = {
  createWorkout,
  getWorkouts,
};
