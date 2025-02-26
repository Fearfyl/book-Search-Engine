import type { Request, Response } from 'express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const foundUser = await User.findOne({
      $or: [
        { _id: req.user ? req.user._id : req.params.id },
        { username: req.params.username }
      ],
    });

    if (!foundUser) {
      return res.status(400).json({ message: 'Cannot find a user with this id!' });
    }

    return res.json(foundUser);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);

    if (!user) {
      return res.status(400).json({ message: 'Something is wrong!' });
    }

    const token = signToken({
      username: user.username,
      email: user.email,
      _id: user._id.toString()
    });

    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login request body:', req.body);

    const user = await User.findOne({
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ],
    });

    if (!user) {
      console.log("Can't find this user");
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(req.body.password);
    console.log('Password correct:', correctPw);

    if (!correctPw) {
      console.log('Wrong password!');
      return res.status(400).json({ message: 'Wrong password!' });
    }

    const token = signToken({
      username: user.username,
      email: user.email,
      _id: user._id.toString()
    });

    console.log('Generated token:', token);

    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const saveBook = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $addToSet: { savedBooks: req.body } },
      { new: true, runValidators: true }
    );

    return res.json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { savedBooks: { bookId: req.params.bookId } } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Couldn't find user with this id!" });
    }

    return res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};