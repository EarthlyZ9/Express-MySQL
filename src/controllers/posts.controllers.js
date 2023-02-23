const { validationResult } = require('express-validator');
const db = require('../models');
const HttpError = require('../utils/httpError');

const Post = db.posts;
const User = db.users;

const createPost = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid input', errors.array()[0].msg, 400));
  }

  const { title, content, name } = req.body;

  // user name 존재하는지 확인
  let existingUser;
  try {
    existingUser = await User.findOne({
      where: { name },
    });
    if (!existingUser) {
      const error = new HttpError('user not found', undefined, 404);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError('something went wrong', err.message, 500);
    return next(error);
  }

  const userId = existingUser.id;

  let newPost;
  try {
    newPost = await Post.create({ title, content, userId });
  } catch (err) {
    const error = new HttpError('Something went wrong', err.message, 500);
    return next(error);
  }

  res.status(201).send(newPost);
};

const getAllPosts = async (req, res, next) => {
  const { author } = req.query;

  let posts;
  if (author) {
    try {
      const userId = parseInt(author, 10);
      posts = await Post.findAll({ where: { userId } });
    } catch (err) {
      const error = new HttpError(
        'invalid query string value',
        'query string `author` should include user id in integer',
        400
      );
      return next(error);
    }
  } else {
    try {
      posts = await Post.findAll({ include: { model: User, as: 'user' } });
    } catch (err) {
      const error = new HttpError('something went wrong', err.message, 500);
      return next(error);
    }
  }

  res.status(200).send(posts);
};

const getPostById = async (req, res, next) => {
  const { postId } = req.params;

  let post;
  try {
    post = await Post.findByPk(postId, {
      include: {
        model: User,
        as: 'user',
      },
    });
    if (!post) {
      const error = new HttpError('post not found', undefined, 404);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError('something went wrong', err.message, 500);
    return next(error);
  }
  res.status(200).send(post);
};

const updatePostById = async (req, res, next) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  // 존재하는 post 인지 확인
  let existingPost;
  try {
    existingPost = await Post.findByPk(postId);
    if (!existingPost) {
      const error = new HttpError('post not found', undefined, 404);
      return next(error);
    }
  } catch (err) {
    const error = HttpError('something went wrong', undefined, 500);
    return next(error);
  }

  // update
  const inputObj = {
    title,
    content,
  };

  // null 인 키값 삭제 (patch)
  Object.keys(inputObj).forEach(
    (k) => inputObj[k] === null && delete inputObj[k]
  );

  Object.keys(inputObj).forEach((k) => (existingPost[k] = inputObj[k]));

  try {
    await existingPost.save({ fields: Object.keys(inputObj) });
    await existingPost.reload();
  } catch (err) {
    const error = new HttpError('something went wrong', undefined, 500);
    return next(error);
  }

  res.status(200).send(existingPost);
};

const deletePostById = async (req, res, next) => {
  const { postId } = req.params;
  const post = await Post.findByPk(postId);
  try {
    if (!post) {
      const error = new HttpError('Post not found', undefined, 404);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError('something went wrong', undefined, 500);
    return next(error);
  }

  try {
    await post.destroy();
    return res.status(200).send(post);
  } catch (err) {
    const error = new HttpError('something went wrong', undefined, 500);
    return next(error);
  }
};

exports.createPost = createPost;
exports.getAllPosts = getAllPosts;
exports.getPostById = getPostById;
exports.updatePostById = updatePostById;
exports.deletePostById = deletePostById;
