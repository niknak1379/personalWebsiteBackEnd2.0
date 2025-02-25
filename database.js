import mysql from 'mysql2'

const DB = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '78M56Soo!',
    database: 'Projects'
}).promise()

let hi = await DB.query("SELECT * FROM Projects;")
console.log(hi)


//Does not support no tags at the moment, could just do an all tag and cheese it
async function getProjects(searchQueryStr, statusStr, tagsArray) {
    if (tagsArray.length == 0) {
        console.log('hi')
    }
   
    let hi = await DB.query(`
        SELECT * FROM Projects 
        JOIN ProjectTags ON Projects.name = ProjectTags.name
        WHERE ProjectTags.tag IN (?)
        AND Projects.name LIKE ?
        AND Projects.status LIKE ?
        `, [tagsArray, `%${searchQueryStr}%`, `%${statusStr}%`])
    console.log(hi)
}

getProjects("nik", "", ["PYTHON"])
async function insertProject(projectObject, tagsObject){
    let name = projectObject.name
    let description = projectObject.description
    let status = projectObject.description
    let pictureURL = projectObject.pictureURL
    let githubURL = projectObject.githubURL
    let deploymentURL = deploymentURL.githubURL

    let insertProject = await DB.query(`
        INSERT INTO Projects (name, description, status, pictureURL, githubURL, deploymentURL)
        VALUES(?, ?, ?, ?, ?, ?)
        INSERT INTO Projects`, [name, description, status, pictureURL, githubURL, deploymentURL])
    console.log(insertProject)
    for (let i = 0; i < tagsObject.length; i++) {
        let tagQuery = await DB.query(`
            INSERT INTO ProjectTags(name, tag)
            VALUES(?, ?)
            `, [name, tagsObject[i]])
        console.log(tagQuery)
    }
}


//empty for now ill just do it manually or sth. 
async function updateProject(projectObject){
    //empty function
}