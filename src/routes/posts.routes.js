const express = require('express');
const { check } = require('express-validator');
const postController = require('../controllers/posts.controllers');

const router = express.Router();

router.get('/', postController.getAllPosts);
router.post(
  '/',
  [
    check('title')
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('title should be max 100 characters'),
    check('content').notEmpty().withMessage('content should not be empty'),
    check('name').notEmpty().withMessage('name should not be empty'),
  ],
  postController.createPost
);
router.get('/:postId', postController.getPostById);
router.patch(
  '/:postId',
  [
    check('title')
      .notEmpty()
      .isLength({ max: 100 })
      .withMessage('title should be max 100 characters'),
    check('content').notEmpty().withMessage('content should not be empty'),
  ],
  postController.updatePostById
);
router.delete('/:postId', postController.deletePostById);

module.exports = router;
