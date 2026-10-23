import express from "express"
import { routes } from "./routes"
import { errorHandling } from "./middlewares/errorHandling"

const app = express()
app.use(express.json())

app.get("/health", (request, response) => {
  return response.json({ status: "ok" })
})

app.use(routes)
app.use(errorHandling)

export { app }