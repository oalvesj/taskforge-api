import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AppError } from "../errors/AppError"
import { authConfig } from "../config/auth"

interface TokenPayload {
  role: string
  sub: string
}

export function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authHeader = request.headers.authorization

  if (!authHeader) {
    throw new AppError("Token não informado", 401)
  }

  const [, token] = authHeader.split(" ")

  try {
    const { role, sub: userId } = jwt.verify(
      token,
      authConfig.jwt.secret
    ) as TokenPayload

    request.user = {
      id: Number(userId),
      role,
    }

    return next()
  } catch {
    throw new AppError("Token inválido", 401)
  }
}
