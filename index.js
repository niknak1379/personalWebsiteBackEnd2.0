import express from 'express'
import {getAllStatus, getAllTags, getProjects, 
    insertProject, getProjectDetails, 
    validateLogin, updateRefreshToken, getRefreshToken} from './database.js'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
const app = express()

app.use(express.json())
app.use(cors());
app.use(cookieParser())
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("DataBase Crashed :(")
})

/*
expected returned data format, array of JSON objects in the following format
   [
    {
      "name": "nik",
      "description": "longs d fs sdj ds ",
      "status": "Complete",
      "pictureURL": "pic url",
      "githubURL": "git url",
      "deploymentURL": "dep url",
    }
    ]
*/
app.get('/:name/:status/:tags/:numberRequested', async (req, res) => {                  
    //send in space for an empty paramter
    if (req.params.name == ' '){
        req.params.name = ''
    }
    if (req.params.status == ' ') {
        req.params.status = ["In Progress", "Complete", "To Be Started"]
    }
    else {
        req.params.status = req.params.status.split('-')
    }
    //send in space for an empty tag
    if (req.params.tags == ' ') {
        req.params.tags = ['ALL']
    }
    else {
        req.params.tags = req.params.tags.split('-')
    }
    console.log(req.params)
    const projects = await getProjects(`${req.params.name}`, req.params.status, req.params.tags, req.params.numberRequested)
    console.log(projects)
    res.send(projects)
})

app.get('/projectDetails/:projectName', async (req, res) => {
    const projectDetails = await getProjectDetails(req.params.projectName)
    console.log(projectDetails)
    res.send(projectDetails)
})
/*
expected returned data format, array of JSON objects in the following format
   [
    {
        "tag": 'tagName',
        "frequency": '1'
    }
    ]
*/
app.get('/tags', async (req, res) => {
    const tags = await getAllTags()
    console.log(tags)
    res.send(tags)
})
/*
expected returned data format, array of JSON objects in the following format
   [
    {
        "status": 'statusName',
        "frequency": '1'
    }
    ]
*/
app.get('/status', async(req, res) => {
    const status = await getAllStatus()
    console.log(status)
    res.send(status)
})


/*
post data expected format
   { 
   "project": {
      "name": "nik",
      "description": "longs d fs sdj ds ",
      "status": "Complete",
      "pictureURL": "pic url",
      "githubURL": "git url",
      "deploymentURL": "dep url",
      "tag": "ALL"
    }
    ,
    "tags": ["PYTHON", "ALL"]
    }
*/
app.post('/',  (req, res) => {
    console.log(req.body.project)
    console.log(req.body.tags)
    /* insertProject(req.body.project, req.body.tags)
    res.send(req.body) */
})

//used once to generate the user hashed password
/* app.get('/hash', async(req, res) => {
    let hash = await bcrypt.hash('', 10)
    console.log(hash)
    let r = await bcrypt.compare('', hash)
    res.send(r)
})
 */



//sends a json in the format {accessToken: value} if everything is valid
app.post('/login', async (req, res) => {
    let {email, password} = req.body
    let hash = await validateLogin(email)
    hash = hash.password
    let validation = await bcrypt.compare(password, hash)

    if (validation) {

        let accessToken = jwt.sign({'user' : email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 60000 * 60})
        let { refreshToken } = await getRefreshToken(email)
        
        
        if (refreshToken == null) {
            refreshToken = jwt.sign({'user': email}, process.env.REFRESH_TOKEN_SECRET)
            updateRefreshToken(email, refreshToken)
        }
        
        res.cookie("refreshToken", refreshToken, {httpOnly: true})
        res.json({accessToken: accessToken})
    }
    else{ 
        res.status(401).send()
    }
})

// middleware function used to authenticate user on private API paths
// sends a status code 401 if the access token is not valid,
// which should redirect the user to seek a refresh token client side.
//
function validateTokenMiddleware(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null){
        res.status(401).send()
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if (err) {
            res.status(401).send('refresh token')
        }
        console.log(decoded)
    })
    next()
}

//sends a json in the format {accessToken: value} if everything is valid
// and refreshes the token
app.post('/refresh', async (req, res) => {
    let clientToken = req.cookies.refreshToken && req.cookies.refreshToken
    if (clientToken == null){
        res.status(401).send('please log in')
    }
    jwt.verify(clientToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err){
            res.status(401).send('please login again')
        }
        let accessToken = jwt.sign({'user' : req.params.email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: 60000 * 60})
        res.json({accessToken: accessToken})
    })
})

app.get('/auth', validateTokenMiddleware, (req,res) => {
    res.send()
})

app.listen(8080, () => {
    console.log('Server running on 8080')
})

