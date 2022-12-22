const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { workoutTypes } = require('../config/workouts');

const workoutSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    group: {
      type: String,
      enum: workoutTypes,
      required: true,
      trim: true,
    },
    pictureUrl: {
      type: String,
      required: false,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
workoutSchema.plugin(toJSON);
workoutSchema.plugin(paginate);

/**
 * @typedef User
 */
const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
