import { Request, Response } from "express"
import { z } from "zod"
import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"

export class TeamsController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      name: z.string().min(3),
      description: z.string().optional(),
    })

    const { name, description } = bodySchema.parse(request.body)

    const team = await prisma.team.create({ data: { name, description } })

    return response.status(201).json(team)
  }

  async index(request: Request, response: Response) {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    })

    return response.json(teams)
  }

  async update(request: Request, response: Response) {
    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      name: z.string().min(3).optional(),
      description: z.string().optional(),
    })
    const { name, description } = bodySchema.parse(request.body)

    const team = await prisma.team.findUnique({ where: { id } })
    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const updated = await prisma.team.update({
      where: { id },
      data: { name, description },
    })

    return response.json(updated)
  }

  async remove(request: Request, response: Response) {
    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const team = await prisma.team.findUnique({ where: { id } })
    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    await prisma.team.delete({ where: { id } })

    return response.status(204).send()
  }
}