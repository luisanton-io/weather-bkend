const UserModel = require("./users/schema")
const { verifyJWT } = require("./users/authTools")

const authorize = async (req,res,next) => {
  try {
    // const token = req.header("Authorization").replace("Bearer ", "")
    // console.log(req)
    const token = req.cookies.accessToken
    const decoded = await verifyJWT(token)
    const user = await UserModel.findOne({
      _id: decoded._id
    })

    if (!user) throw new Error ("Please authenticate")

    req.token = token
    req.user = user
    next()

  } catch (error) {
    error.httpStatusCode = 401
    next(error)
  }
}

const adminOnly = async (req, res, next) => {
  if (req.user && req.user.role === "admin") next()
  else {
    const err = new Error("Only for admins!")
    err.httpStatusCode = 403
    next(err)
  }
}

module.exports = { authorize, adminOnly }
