const express = require("express")
const q2m = require("query-to-mongo")
const { authorize } = require("../auth")

const UserSchema = require("./schema")
const UserModel = require("./schema")
const { authenticate, refreshToken } = require("./authTools")

const usersRouter = express.Router()
const passport = require("passport")

//debugg
usersRouter.get("/me", authorize, async (req, res, next) => {
  try {
    res.send(req.user)
  } catch (error) {
    next("While reading users list a problem occurred!")
  }
})

usersRouter.post("/signup", async (req, res, next) => {
  try {
    const newUser = new UserSchema(req.body)
    const { _id } = await newUser.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

usersRouter.put("/me", authorize, async (req, res, next) => {
  try {
    const updates = Object.keys(req.body)

    try {
      updates.forEach((update) => (req.user[update] = req.body[update]))
      await req.user.save()
      res.send(req.user)
    } catch (e) {
      res.status(400).send(e)
    }
  } catch (error) {
    next(error)
  }
})

usersRouter.delete("/me", authorize, async (req, res, next) => {
  try {
    await req.user.remove()
    res.send("Deleted")
  } catch (error) {
    next(error)
  }
})

usersRouter.post("/login", async (req,res,next) => {
  try {
    const { email, password } = req.body
    const user = await UserModel.findByCredentials(email, password)

    if (!user) throw new Error("User doesn't exist")

    const { token, refreshToken } = await authenticate(user)

    res.cookie("accessToken", token, {
      path:"/",
      httpOnly: true
    })

    res.cookie("refreshToken", refreshToken, {
      path:["/users/refreshToken", "/logout"],
      httpOnly: true
    })

    res.send()

  } catch (error) {
    error.httpStatusCode = 400
    next(error)
  }
})

usersRouter.post("/logout", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = req.user.refreshTokens.filter(
      (t) => t.token !== req.body.refreshToken
    )
    await req.user.save()
    res.send()
  } catch (err) {
    next(err)
  }
})

usersRouter.post("/logoutAll", authorize, async (req, res, next) => {
  try {
    req.user.refreshTokens = []
    await req.user.save()
    res.send()
  } catch (err) {
    next(err)
  }

})

usersRouter.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing")
    err.httpStatusCode = 403
    next(err)
  } else {
    try {
      const tokens = await refreshToken(oldRefreshToken)

      res.cookie("accessToken", tokens.token, {
        httpOnly: true,
      })
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        path: "/users/refreshToken",
      })
      res.send()
    } catch (error) {
      console.log(error)
      const err = new Error(error)
      err.httpStatusCode = 403
      next(err)
    }
  }
})

usersRouter.get("/fbLogin", 
  passport.authenticate("facebook")
)

usersRouter.get('/facebook/callback',
  passport.authenticate("facebook", { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect(`http://localhost:3000/home`);
  });


usersRouter.post("/cities", authorize, async(req,res,next)=> {
try {
  let city = req.body.city

  if (!city) throw new Error ("City not defined")

  let user = req.user

  if (!user.cities.some( _city => _city.id === city.id )) {

    user.cities = [
      ...user.cities, city
    ]
  
    await user.save()
  }

  res.status(200).send(user.cities)
  
} catch (error) {
  error.httpStatusCode = 400
  next(error)
}
})

usersRouter.delete("/cities/:id", authorize, async (req,res,next) => {
  try {
    req.user.cities = req.user.cities.filter( city => city.id !== parseInt(req.params.id))

    await req.user.save()
  
    res.send("Deleted.")
  } catch (error) {
    next(error)
  }
})

usersRouter.get("/cities", authorize, async(req,res, next) => {
  try {
    if (!req.user.cities) throw new Error("No cities")
    res.send(req.user.cities)
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter
