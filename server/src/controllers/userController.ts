import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userExists = await User.findOne({ email: req.query.email });
    if (!userExists)
      return res.status(400).json({ title: "Пользователь не существует" });

    return res.status(200).json({
      _id: userExists._id,
      email: userExists.email,
      firstName: userExists.firstName,
      lastName: userExists.lastName,
      middleName: userExists.middleName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (!userExists)
      return res
        .status(400)
        .json({ title: "Пользователь не существует", error: "email" });

    if (userExists.password !== req.body.password)
      return res
        .status(400)
        .json({ title: "Неверный пароль", error: "password" });

    const accessToken = jwt.sign(
      { id: userExists._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      title: "Вы вошли в систему",
      accessToken: accessToken,
      user: {
        _id: userExists._id,
        email: userExists.email,
        firstName: userExists.firstName,
        lastName: userExists.lastName,
        middleName: userExists.middleName,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ title: "Server Error" });
    next(error);
  }
}

export async function register(req: Request, res: Response) {
  try {
    const user = await User.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      middleName: req.body.middleName,
      password: req.body.password,
    });

    return res.status(201).json({
      title: "Пользователь зарегистрирован",
      message: "Войдите в систему с использованием новых данных",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ title: "Пользователь с таким почтовым ящиком уже существует" });
  }
}
