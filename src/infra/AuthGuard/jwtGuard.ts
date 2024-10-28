import { NextFunction, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

export const SECRET_KEY: Secret = "teste";

export const jwtGuard = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Nenhum token foi adicionado na requisicao." });
  }

  const bearer = token.split(" ");
  const jwtToken = bearer.length === 2 ? bearer[1] : token;

  jwt.verify(jwtToken, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token." });
    }

    req.userId = decoded.id;
    req.userName = decoded.name;

    next();
  });
};
