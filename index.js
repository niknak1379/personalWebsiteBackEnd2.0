import express from 'express'
import {getProjects, insertProject} from './database.js'
const app = express()
app.get('/', async (req, res) => {
    const notes = await getProjects('nik', '', ['PYTHON', 'WEBDEV'])
    console.log(notes)
    res.send(notes)
})
app.listen(8080, () => {
    console.log('Server running on 8080')
})