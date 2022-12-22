const express = require('express');
const auth = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const workoutValidation = require('../validations/workout.validation');
const workoutController = require('../controllers/workout.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('createWorkout'), validate(workoutValidation.createWorkout), workoutController.createWorkout)
  .get(auth('getWorkout'), validate(workoutValidation.getWorkout), workoutController.getWorkouts);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Workouts
 *   description: Workouts
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a workout
 *     description: Only users with createWorkout permission can create workouts.
 *     tags: [Wokouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - group
 *             properties:
 *               name:
 *                 type: string
 *               group:
 *                 type: integer
 *               pictureUrl:
 *                 type: string
 *               description:
 *                  type: string
 *             example:
 *               name: fake name
 *               group: faker group id
 *               pictureUrl: http://<serverUrl>/public/workouts/<image_url>
 *               description: faker workout description
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Workout'
 *       "400":
 *         $ref: '#/components/responses/DuplicateWorkout'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all workouts
 *     description: Only users with getWorkouts are able to fetch workouts.
 *     tags: [Wokouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Workout name
 *       - in: query
 *         name: group
 *         schema:
 *           type: integer
 *         description: Workout group
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of workouts
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */
