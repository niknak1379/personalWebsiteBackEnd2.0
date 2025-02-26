import express from 'express'
import {getProjects, insertProject} from './database.js'
const app = express()
app.get('/:id/:description/:tags', async (req, res) => {
    console.log(req.params)
    //send in space for an empty paramter
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
    const notes = await getProjects(`${req.params.id}`, `${req.params.description}`, req.params.tags)
    console.log(notes)
    res.send(notes)
})
app.listen(8080, () => {
    console.log('Server running on 8080')
})