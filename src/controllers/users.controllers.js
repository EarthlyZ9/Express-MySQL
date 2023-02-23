const { validationResult } = require('express-validator');
const db = require('../models');
const HttpError = require('../utils/httpError');

const User = db.users;

const createUser = async (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return next(new HttpError('Invalid input', errors.array()[0].msg, 400));
  }

  const { email, name, password, introduction } = req.body;

  let existingUserEmail;
  let existingUserName;
  try {
    existingUserEmail = await User.findOne({ where: { email } });
    if (existingUserEmail) {
      const error = new HttpError(
        'Duplicate email',
        'provided email already exists',
        409
      );
      return next(error);
    }

    existingUserName = await User.findOne({ where: { name } });
    if (existingUserName) {
      const error = new HttpError(
        'Duplicate name',
        'provided name already exists',
        409
      );
      return next(error);
    }
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      'Sign up failed, please try again',
      err.message,
      500
    );
    return next(error);
  }

  let newUser;
  try {
    newUser = await User.create({ email, name, password, introduction });
  } catch (err) {
    const error = new HttpError(
      'Sign up failed, please try again',
      err.message,
      500
    );
    return next(error);
  }

  res.status(201).send(newUser);
};

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.findAll({
      attributes: { exclude: ['password'] },
    });
  } catch (err) {
    const error = HttpError('something went wrong', undefined, 500);
    return next(error);
  }

  res.status(200).send(users);
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  let user;
  try {
    user = await User.findByPk(userId);
    if (!user) {
      const error = new HttpError('user not found', undefined, 404);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError('something went wrong', err.message, 500);
    return next(error);
  }
  res.status(200).send(user);
};

const updateUserById = async (req, res, next) => {
  const { userId } = req.params;
  const { name, introduction } = req.body;

  // 존재하는 유저인지 확인
  let existingUser;
  try {
    existingUser = await User.findByPk(userId);
    if (!existingUser) {
      const error = new HttpError('user not found', undefined, 404);
      return next(error);
    }
  } catch (err) {
    const error = HttpError('something went wrong', undefined, 500);
    return next(error);
  }

  // update
  const inputObj = {
    name,
    introduction,
  };

  console.log(inputObj);

  // null 인 키값 삭제 (patch)
  Object.keys(inputObj).forEach((k) => !inputObj[k] && delete inputObj[k]);

  Object.keys(inputObj).forEach((k) => (existingUser[k] = inputObj[k]));

  try {
    await existingUser.save({ fields: Object.keys(inputObj) });
    await existingUser.reload();
  } catch (err) {
    console.log(err);
    const error = new HttpError('something went wrong', undefined, 500);
    return next(error);
  }

  res.status(200).send(existingUser);
};

const deleteUserById = async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findByPk(userId);
  try {
    if (!user) {
      const error = new HttpError('User not found', undefined, 404);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError('something went wrong', undefined, 500);
    return next(error);
  }

  try {
    await user.destroy();
    return res.status(200).send(user);
  } catch (err) {
    const error = new HttpError('something went wrong', undefined, 500);
    return next(error);
  }
};

exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.updateUserById = updateUserById;
exports.deleteUserById = deleteUserById;
