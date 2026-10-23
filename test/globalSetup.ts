import { config } from "dotenv"
import { execSync } from "node:child_process"

config({ path: ".env.test" })

export default async function globalSetup() {
  execSync("npx prisma migrate reset --force --skip-seed", {
    stdio: "inherit",
  })
}
