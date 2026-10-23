import { Request, Response, NextFunction } from "express"
import { AppError } from "../errors/AppError"

export function verifyUserAuthorization(roles: string[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user) {
      throw new AppError("Usuário não autenticado", 401)
    }

    if (!roles.includes(request.user.role)) {
      throw new AppError("Usuário não autorizado", 403)
    }

    return next()
  }
}