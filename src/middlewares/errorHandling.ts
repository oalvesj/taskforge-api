import { ErrorRequestHandler } from "express"
import { ZodError } from "zod"
import { AppError } from "../errors/AppError"

export const errorHandling: ErrorRequestHandler = (
  error,
  request,
  response,
  next
) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ message: error.message })
    return
  }

  if (error instanceof ZodError) {
    response
      .status(400)
      .json({ message: "Erro de validação", issues: error.issues })
    return
  }

  console.error(error)
  response.status(500).json({ message: "Erro interno do servidor" })
}
