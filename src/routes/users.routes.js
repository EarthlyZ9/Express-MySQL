const express = require('express');
const { check } = require('express-validator');
const { param } = require('express/lib/application');
const userController = require('../controllers/users.controllers');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.post(
  '/',
  [
    check('email').notEmpty().withMessage('email should not be empty'),
    check('name')
      .notEmpty()
      .isLength({ min: 3, max: 10 })
      .withMessage('name should not be between 3 and 10 characters'),
    check('password')
      .notEmpty()
      .isLength({ min: 8 })
      .withMessage('password should not be at least 8 characters'),
    check('introduction')
      .notEmpty()
      .isLength({ max: 200 })
      .withMessage('introduction should be max 200 characters'),
  ],
  userController.createUser
);
router.get('/:userId', userController.getUserById);

router.patch(
  '/:userId',
  [
    check('name').optional(),
    check('introduction').optional().isLength({ max: 200 }),
  ],
  userController.updateUserById
);
router.delete('/:userId', userController.deleteUserById);

module.exports = router;
