import express from 'express'
import {getAllStatus, getAllTags, getProjects, 
    insertProject, getProjectDetails, 
    validateLogin, updateRefreshToken, getRefreshToken} from './database.js'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import auth from './Routes/authentication.js'

const app = express()
app.use('/', auth)
app.use(express.json())

var corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:80'],
    credentials: true };
app.use(cors(corsOptions));

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



 
app.listen(8080, () => {
    console.log('Server running on 8080')
})

