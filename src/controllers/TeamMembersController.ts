import { Request, Response } from "express"
import { z } from "zod"
import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"

export class TeamMembersController {
  async create(request: Request, response: Response) {
    const paramsSchema = z.object({ team_id: z.coerce.number() })
    const { team_id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({ userId: z.coerce.number() })
    const { userId } = bodySchema.parse(request.body)

    const team = await prisma.team.findUnique({ where: { id: team_id } })
    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      throw new AppError("Usuário não encontrado", 404)
    }

    const alreadyMember = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId: team_id } },
    })
    if (alreadyMember) {
      throw new AppError("Usuário já é membro deste time")
    }

    const member = await prisma.teamMember.create({
      data: { userId, teamId: team_id },
    })

    return response.status(201).json(member)
  }

  async index(request: Request, response: Response) {
    const paramsSchema = z.object({ team_id: z.coerce.number() })
    const { team_id } = paramsSchema.parse(request.params)

    const members = await prisma.teamMember.findMany({
      where: { teamId: team_id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return response.json(members)
  }

  async remove(request: Request, response: Response) {
    const paramsSchema = z.object({
      team_id: z.coerce.number(),
      user_id: z.coerce.number(),
    })
    const { team_id, user_id } = paramsSchema.parse(request.params)

    const member = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: user_id, teamId: team_id } },
    })
    if (!member) {
      throw new AppError("Membro não encontrado neste time", 404)
    }

    await prisma.teamMember.delete({ where: { id: member.id } })

    return response.status(204).send()
  }
}