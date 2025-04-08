import express from "express";
import {getAllStatus, getAllTags, getProjects, 
    insertProject, getProjectDetails, 
    validateLogin, updateRefreshToken, getRefreshToken} from '../database.js'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import google from './passportGoogleOauth.js'
import passport from "passport";

const app = express.Router()
app.use(express.json())

var corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:80'],
    credentials: true };
app.use(cors(corsOptions));
app.use('/', google)
app.use(cookieParser())

//sends a json in the format {accessToken: value} if everything is valid
app.post('/login', async (req, res) => {
    console.log(req.body)
    try{
        let {email, password} = req.body
        let hash = await validateLogin(email)
        hash = hash.password
        let validation = await bcrypt.compare(password, hash)
        if (validation) {

            let accessToken = jwt.sign({'user' : email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            let { refreshToken } = await getRefreshToken(email)
            
            
            if (refreshToken == null) {
                refreshToken = jwt.sign({'user': email}, process.env.REFRESH_TOKEN_SECRET)
                updateRefreshToken(email, refreshToken)
            }
            
            res.cookie("refreshToken", refreshToken, {httpOnly: true, maxAge: 2592000000})
            res.json({accessToken: accessToken})
        }
        else{ 
            res.status(401).send('wrong password')
        }
    }
    catch(e){
        console.log(e)
        return
    }
})

app.post('/logout', (req, res) => {
    if (req.cookies.refreshToken == null) res.status(203).send('no refresh token to logout')
    console.log('refresh token from logout', req.cookies.refreshToken)
    res.clearCookie('refreshToken', {httpOnly: true})
    res.send('successfully logged out')
})

// middleware function used to authenticate user on private API paths
// sends a status code 401 if the access token is not valid,
// which should redirect the user to seek a refresh token client side.
//
function validateTokenMiddleware(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log('auth header', token)
    if (token == null){
        res.status(401).send('token is null homie')
        return
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if (err) {
            res.status(401).send('refresh token')
            return
        }
        console.log(decoded)
    })
    next()
}

//sends a json in the format {accessToken: value} if everything is valid
// and refreshes the token
app.post('/refresh', async (req, res) => {
    let clientToken = req.cookies.refreshToken && req.cookies.refreshToken
    console.log(req.cookies)
    if (clientToken == null){
        res.status(403).send('please log in')
        return
    }
    jwt.verify(clientToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err){
            res.status(409).send('please login again')
            return
        }
        let accessToken = jwt.sign({'user' : req.params.email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 60000 * 60})
        res.json({accessToken: accessToken})
    })
})

app.get('/auth', validateTokenMiddleware, (req,res) => {
    res.send('authenticated')
})



export default app