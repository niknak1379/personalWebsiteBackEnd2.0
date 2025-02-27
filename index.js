import express from 'express'
import {getProjects, insertProject} from './database.js'
const app = express()
app.use(express.json())

app.get('/:name/:description/:tags', async (req, res) => {
    console.log(req.params)
    //send in space for an empty paramter
    if (req.params.name == ' '){
        req.params.name = ''
    }
    if (req.params.description == ' '){
        req.params.description = ''
    }
    //send in space for an empty tag
    if (req.params.tags == ' ') {
        req.params.tags = ['ALL']
    }
    else {
        req.params.tags = req.params.tags.split('-')
    }
    console.log(req.params)
    const projects = await getProjects(`${req.params.name}`, `${req.params.description}`, req.params.tags)
    console.log(projects)
    res.send(projects)
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
    insertProject(req.body.project, req.body.tags)
    res.send(req.body)
})
app.listen(8080, () => {
    console.log('Server running on 8080')
})

app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send("DataBase Crashed :(")
})