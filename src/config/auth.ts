export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET ?? "default-secret",
    expiresIn: "1d",
  },
}
