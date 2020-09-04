const dotenv = require("dotenv")
dotenv.config()

const port = process.env.PORT
const { join } = require("path")
const staticFolderPath = join(__dirname, "../public")
const express = require("express")
const cors = require("cors")
const listEndpoints = require("express-list-endpoints")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")

const usersRouter = require("./services/users")
const searchRouter = require("./services/search")
const weatherRouter = require("./services/weather")

const server = express()
const passport = require("passport")
require("./services/users/oauth")

const {
  notFoundHandler,
  forbiddenHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers")

server.use(cookieParser())

const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}
server.use(cors(corsOptions))

server.use(express.static(staticFolderPath))
server.use(express.json())
server.use(passport.initialize())

server.use("/users", usersRouter)
server.use("/search", searchRouter)
server.use("/weather", weatherRouter)

server.use(badRequestHandler)
server.use(forbiddenHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

console.log(listEndpoints(server))

mongoose
  .connect("mongodb://localhost:27018/weather-app", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port)
    })
  )
  .catch((err) => console.log(err))
