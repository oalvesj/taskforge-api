import { Request, Response } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"
import { authConfig } from "../config/auth"

export class SessionsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = bodySchema.parse(request.body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      throw new AppError("E-mail ou senha inválidos", 401)
    }

    const passwordMatched = await bcrypt.compare(password, user.password)

    if (!passwordMatched) {
      throw new AppError("E-mail ou senha inválidos", 401)
    }

    const token = jwt.sign({ role: user.role }, authConfig.jwt.secret, {
      subject: String(user.id),
      expiresIn: authConfig.jwt.expiresIn,
    })

    const { password: _, ...userWithoutPassword } = user

    return response.json({ token, user: userWithoutPassword })
  }
}