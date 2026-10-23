import { Router } from "express"
import { TasksController } from "../controllers/TasksController"
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated"
import { verifyUserAuthorization } from "../middlewares/verifyUserAuthorization"

const tasksRoutes = Router()
const tasksController = new TasksController()

tasksRoutes.use(ensureAuthenticated)

tasksRoutes.post("/", verifyUserAuthorization(["admin"]), tasksController.create)
tasksRoutes.get("/", tasksController.index)
tasksRoutes.put("/:id", tasksController.update)
tasksRoutes.get("/:id/history", tasksController.history)
tasksRoutes.delete("/:id", verifyUserAuthorization(["admin"]), tasksController.remove)

export { tasksRoutes }