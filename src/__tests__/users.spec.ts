import request from "supertest"
import { app } from "../app"
import { prisma } from "../prisma"

describe("Usuários e sessões", () => {
  afterAll(async () => {
    await prisma.$disconnect()
  })

  it("deve criar um novo usuário", async () => {
    const response = await request(app).post("/users").send({
      name: "Usuário Teste",
      email: "teste@taskforge.com",
      password: "123456",
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body).not.toHaveProperty("password")
  })

  it("não deve criar usuário com e-mail já cadastrado", async () => {
    const response = await request(app).post("/users").send({
      name: "Outro",
      email: "teste@taskforge.com",
      password: "123456",
    })

    expect(response.status).toBe(400)
  })

  it("deve autenticar e retornar um token", async () => {
    const response = await request(app).post("/sessions").send({
      email: "teste@taskforge.com",
      password: "123456",
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("token")
  })
})