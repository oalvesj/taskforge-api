import { Request, Response } from "express"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"

export class UsersController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().min(3),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(["admin", "member"]).default("member"),
    })

    const { name, email, password, role } = bodySchema.parse(request.body)

    const userExists = await prisma.user.findUnique({ where: { email } })

    if (userExists) {
      throw new AppError("E-mail já cadastrado")
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    })

    const { password: _, ...userWithoutPassword } = user

    return response.status(201).json(userWithoutPassword)
  }
}