import { Router } from "express"
import { TeamsController } from "../controllers/TeamsController"
import { TeamMembersController } from "../controllers/TeamMembersController"
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated"
import { verifyUserAuthorization } from "../middlewares/verifyUserAuthorization"

const teamsRoutes = Router()
const teamsController = new TeamsController()
const teamMembersController = new TeamMembersController()

teamsRoutes.use(ensureAuthenticated)
teamsRoutes.use(verifyUserAuthorization(["admin"]))

teamsRoutes.post("/", teamsController.create)
teamsRoutes.get("/", teamsController.index)
teamsRoutes.put("/:id", teamsController.update)
teamsRoutes.delete("/:id", teamsController.remove)

teamsRoutes.post("/:team_id/members", teamMembersController.create)
teamsRoutes.get("/:team_id/members", teamMembersController.index)
teamsRoutes.delete("/:team_id/members/:user_id", teamMembersController.remove)

export { teamsRoutes }
