import { Strategy } from "passport-google-oauth20";
import passport from "passport";
import {validateLogin} from '../database.js'
import express from 'express'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express.Router()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:80'],
    credentials: true }));

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function(accessToken, refreshToken, profile, cb) {
    try{
    let user = await validateLogin(profile.id)
    console.log('logging google profile',profile.id)
    console.log('logging google profile',user)
    if(user.name == profile.id) return cb(null, profile.id); throw new error('account not authorized')
    }
    catch(error) { return cb(error, null)}
  }
));



app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'], session: false })
);

app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth/failure', session: false }),
    async function(req, res) {
        let accessToken = jwt.sign({}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})       
        let refreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET) 
        res.cookie("refreshToken", refreshToken, {httpOnly: true, maxAge: 2592000000})
        res.redirect('http://localhost:3000')
        //res.json({accessToken: accessToken})
});
app.get('/auth/failure', (req, res) => {
    res.send('failed google auth')
})

export default app




