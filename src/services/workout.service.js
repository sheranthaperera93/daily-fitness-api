const httpStatus = require('http-status');
const { Workout } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a workout
 * @param {Object} workoutBody
 * @returns {Promise<Workout>}
 */
const createWorkout = async (workoutBody) => {
  const userId = parseInt(process.env.userId, 2);
  if (await Workout.findOne({ name: workoutBody.name, userId })) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Workout name already exist');
  }
  return Workout.create(workoutBody);
};

/**
 * Query for workouts
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryWorkouts = async (filter, options) => {
  const workouts = await Workout.paginate(filter, options);
  return workouts;
};

module.exports = {
  createWorkout,
  queryWorkouts,
};
