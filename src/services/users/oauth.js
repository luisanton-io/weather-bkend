const passport = require("passport")
const FbStrategy = require("passport-facebook").Strategy
const UserModel = require("./schema")
const { authenticate } = require("./authTools");
const auth = require("../auth");

passport.use(
  "facebook",
  new FbStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: process.env.FB_CALLBACK_URL,
      profileFields: ["email", "name"]
    },
    async (accessToken, refreshToken, profile, done) => {
      const { email, first_name, last_name, id } = profile._json;

      const newUser = {
        email,
        firstName: first_name,
        lastName: last_name,
        refreshTokens: [],
        fbAuthId: id
      };

      try {
        const user = await UserModel.findOne({fbAuthId: profile.id})

        if (!user) user = (await UserModel.create(newUser))

        const tokens = await authenticate(user)

        done(null, {user, tokens})
      } catch (error) {
        console.log(error)
        done(error)
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  done(null, user)
})
