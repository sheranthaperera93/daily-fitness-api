const Joi = require('joi');

const createWorkout = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    group: Joi.number().integer().required(),
    pictureUrl: Joi.string(),
    description: Joi.string(),
  }),
};

const getWorkout = {
  query: Joi.object().keys({
    name: Joi.string(),
    group: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createWorkout,
  getWorkout,
};
