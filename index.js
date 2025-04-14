import express from 'express'
import {getAllStatus, getAllTags, getProjects, 
    insertProject, getProjectDetails, 
    deleteProject, updateProject} from './database.js'
import { validateTokenMiddleware } from './Routes/authentication.js'
import cors from 'cors'
import multer from 'multer'
import cookieParser from 'cookie-parser'
import auth from './Routes/authentication.js'
import { PutObjectAclCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

const app = express()
const storage = multer.memoryStorage()
const upload  = multer({storage: storage})

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

/*
    Expected output strutcture:
    {
        longDescription: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.\n' +
            'It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, \n' +
            'will most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.\n' +
            'Also if you are reading this please donate to the club through the venmo link it is much appreciated :)',
        status: 'Complete',
        githubURL: 'https://github.com/niknak1379/pasa-website',
        deploymentURL: 'https://pasaatucsd.com/',
        pictureURL: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainLight.avif',
        carouselImage_1: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/mainDark.avif',
        carouselImage_2: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/venmo.avif',
        carouselImage_3: 'https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA/page.avif',
        obsidianURL: 'https://notes.nikanostovan.dev/',
        tags: [ 'ALL', 'React', 'Tailwind', 'FrontEnd' ]
    }
*/
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



const S3 = new S3Client({
    region: process.env.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    }
})


//need to also delete the s3 path of the project as well
app.delete('/:projectName', validateTokenMiddleware, async (req, res) => {
    const projectDetails = await getProjectDetails(req.params.projectName)
    if (projectDetails == null){
        res.status(403).send('project not found')
    }
    const deletedProject = await deleteProject(req.params.projectName)
    console.log(deletedProject)
    res.status(201).send('ok')
})



const projectImageFields = upload.fields([{name: 'pictureURL'}, {name: 'carouselImage_1'}, {name: 'carouselImage_2'},
    {name: 'carouselImage_3'}
])


    /*
        projectObject returned as the req.body
        picture links will have to be appended.
        {
            name: "PASA club's Website",
            description: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.',
            londDescription: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.\r\n' +
                'It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, \r\n' +
                'will most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.\r\n' +
                'Also if you are reading this please donate to the club through the venmo link it is much appreciated :)',
            githubURL: 'https://github.com/niknak1379/pasa-website',
            obsidianURL: 'https://notes.nikanostovan.dev/',
            deploymentURL: 'https://pasaatucsd.com/',
            tags: 'ALL-React-Tailwind-FrontEnd'
        }
         picture object structure
        {
            fieldname: 'picture',
            originalname: 'placeholder.avif',
            encoding: '7bit',
            mimetype: 'image/avif',
            buffer: <Buffer 00 00  00 f2 6d8 64 ... 826 more bytes>,
            size: 876
        }
    */
app.put('/editProject',  validateTokenMiddleware, projectImageFields ,async (req, res) => {
    console.log('files', req.files)
    let filesArr = [req.files.pictureURL, 
    req.files.carouselImage_1, 
    req.files.carouselImage_2, 
    req.files.carouselImage_3
    ]
    let photoArr = []
    filesArr.map(item => {if (item != null) photoArr.push(item[0])})

    
    //sends photos to the s3 bucket, generate public url of photos
    //and attach to the req body.
    //
    //no need to update img urls in the DB since the urls generated
    //will be the same for all images based on the clientside form field
    //names. probably not a secure practice but whatevs.
    photoArr.map((photo) => {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: process.env.S3_PROJECT_DIR + 
                 req.body.name + '/' + photo.fieldname,
            Body: photo.buffer,
            ContentType: photo.mimetype
        })
        console.log(command)
        try{
            let h = S3.send(command)
            //console.log(h)
            req.body[photo.fieldname] = process.env.S3_IMG_URL_PREFIX + req.body.name + `/${photo.fieldname}`
            console.log('after s3 call',req.body)
        }
        catch(error){
            console.log(error)
            res.status(501).send('unexpected server error')
        }
        //console.log(req.body)
    })
    
    let h = await updateProject(req.body)
    
    
    res.send('hi')
})

app.post('/newProject',  validateTokenMiddleware, projectImageFields ,async (req, res) => {
    console.log(req.files)
    let photoArr = [req.files.pictureURL[0], req.files.carouselImage_1[0], 
                    req.files.carouselImage_2[0], req.files.carouselImage_3[0]]

    //sends photos to the s3 bucket, generate public url of photos
    //and attach to the req body.
    photoArr.map((photo) => {
        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: process.env.S3_PROJECT_DIR + 
                 req.body.name + '/' + photo.fieldname,
            Body: photo.buffer,
            ContentType: photo.mimetype
        })
        console.log(command)
        try{
            let h = S3.send(command)
            //console.log(h)
            req.body[photo.fieldname] = process.env.S3_IMG_URL_PREFIX + req.body.name + `/${photo.fieldname}`
            console.log('after s3 call',req.body)
        }
        catch(error){
            console.log(error)
            res.status(501).send('unexpected server error')
        }
        //console.log(req.body)
    })

   
    let h = await insertProject(req.body)
    res.send('hi')
})

  
app.listen(8080, () => {
    console.log('Server running on 8080')
})

