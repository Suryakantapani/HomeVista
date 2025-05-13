const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

passport.use(new LocalStrategy(
  { usernameField:'email'},
  async (email,password,done)=>{
    const user=await User.findOne({email});
    if (!user) return done(null, false);
    const match=await bcrypt.compare(password,user.password);
    return match?done(null,user):done(null,false);
  }
));
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, 
async (accessToken, refreshToken, profile, done) => {
  const existing = await User.findOne({ googleId: profile.id });
  if (existing) return done(null, existing);
  const user = await User.create({
    name: profile.displayName,
    email: profile.emails[0].value,
    googleId: profile.id
  });
  done(null, user);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});