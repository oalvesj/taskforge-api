import { Request, Response } from "express"
import { z } from "zod"
import { prisma } from "../prisma"
import { AppError } from "../errors/AppError"

const statusEnum = z.enum(["pending", "in_progress", "completed"])
const priorityEnum = z.enum(["high", "medium", "low"])

export class TasksController {
  async create(request: Request, response: Response) {
    const bodySchema = z.object({
      title: z.string().min(3),
      description: z.string().optional(),
      priority: priorityEnum.default("medium"),
      status: statusEnum.default("pending"),
      assignedTo: z.coerce.number().optional(),
      teamId: z.coerce.number(),
    })

    const data = bodySchema.parse(request.body)

    const team = await prisma.team.findUnique({ where: { id: data.teamId } })
    if (!team) {
      throw new AppError("Time não encontrado", 404)
    }

    if (data.assignedTo) {
      const member = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: { userId: data.assignedTo, teamId: data.teamId },
        },
      })
      if (!member) {
        throw new AppError("O responsável precisa ser membro do time")
      }
    }

    const task = await prisma.task.create({ data })

    return response.status(201).json(task)
  }

  async index(request: Request, response: Response) {
    const user = request.user!

    if (user.role === "admin") {
      const tasks = await prisma.task.findMany({ orderBy: { createdAt: "desc" } })
      return response.json(tasks)
    }

    const memberships = await prisma.teamMember.findMany({
      where: { userId: user.id },
      select: { teamId: true },
    })
    const teamIds = memberships.map((m) => m.teamId)

    const tasks = await prisma.task.findMany({
      where: { teamId: { in: teamIds } },
      orderBy: { createdAt: "desc" },
    })

    return response.json(tasks)
  }

  async update(request: Request, response: Response) {
    const user = request.user!

    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const bodySchema = z.object({
      title: z.string().min(3).optional(),
      description: z.string().optional(),
      priority: priorityEnum.optional(),
      status: statusEnum.optional(),
      assignedTo: z.coerce.number().optional(),
    })
    const data = bodySchema.parse(request.body)

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      throw new AppError("Tarefa não encontrada", 404)
    }

    if (user.role !== "admin" && task.assignedTo !== user.id) {
      throw new AppError("Você só pode editar as suas tarefas", 403)
    }

    const updated = await prisma.task.update({ where: { id }, data })

    if (data.status && data.status !== task.status) {
      await prisma.taskHistory.create({
        data: {
          taskId: task.id,
          changedBy: user.id,
          oldStatus: task.status,
          newStatus: data.status,
        },
      })
    }

    return response.json(updated)
  }

  async history(request: Request, response: Response) {
    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const history = await prisma.taskHistory.findMany({
      where: { taskId: id },
      orderBy: { changedAt: "desc" },
      include: { user: { select: { id: true, name: true } } },
    })

    return response.json(history)
  }

  async remove(request: Request, response: Response) {
    const paramsSchema = z.object({ id: z.coerce.number() })
    const { id } = paramsSchema.parse(request.params)

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) {
      throw new AppError("Tarefa não encontrada", 404)
    }

    await prisma.task.delete({ where: { id } })

    return response.status(204).send()
  }
}