import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const DB = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()



//Does not support no tags at the moment, could just do an all tag and cheese it
//Doest return duplicates atm, should change that.
//could make the tags not show on the list page of the projects but on the dedicated
//page of each project instead.

/*     let queryWithDuplicates = await DB.query(`
        SELECT * FROM Projects 
        JOIN ProjectTags ON Projects.name = ProjectTags.name
        WHERE ProjectTags.tag IN (?)
        AND Projects.name LIKE ?
        AND Projects.status LIKE ?
        GROUP BY Projects.name
        HAVING COUNT(DISTINCT ProjectTags.tag) = ?
        `, [tagsArray, `%${searchQueryStr}%`, `%${statusStr}%`, tagsArray.length]) */
export async function getProjects(searchQueryStr, statusArr, tagsArray, entriesRequested) {
    if (tagsArray.length == 0) {
        //console.log('hi')
    }
    
    let queryWithDuplicates = await DB.query(`
        SELECT * FROM Projects 
        JOIN ProjectTags ON Projects.name = ProjectTags.name
        WHERE ProjectTags.tag IN (?)
        AND Projects.name LIKE ?
        AND Projects.status IN (?)
        GROUP BY Projects.name
        HAVING COUNT(DISTINCT ProjectTags.tag) = ?
        `, [tagsArray, `%${searchQueryStr}%`, statusArr, tagsArray.length])
    

    //handle duplicates
    let set = new Set()
    let returnList = []
    //console.log(queryWithDuplicates[0][0]);
    for (let i = 0; i < queryWithDuplicates[0].length; i++){
        //console.log(queryWithDuplicates[0][i].name)
        if (set.has(queryWithDuplicates[0][i].name)){
            continue
        }
        set.add(queryWithDuplicates[0][i].name)
        returnList.push(queryWithDuplicates[0][i])
    }
    if (entriesRequested <= 0){
        entriesRequested = returnList.length
    } 
    returnList.length = Math.min(returnList.length, entriesRequested)
    
    return returnList
}
let h = await getProjects('', ["Complete", "In Progress"], ["ALL"], 10)
console.log(h)

//returns all tags and their frequencies
export async function getAllTags(){
    let query = await DB.query(`
        SELECT tag, COUNT(*) AS Frequency
        FROM ProjectTags
        GROUP BY tag
        ORDER BY Frequency DESC;
        `, [])
    return query[0]
}
export async function getAllStatus(){
    let query = await DB.query(`
        SELECT status, COUNT(*) AS Frequency
        FROM Projects
        GROUP BY status
        `
    )
    return query[0]
}


//getProjects("nik", "", ["PYTHON", "WEBDEV"])
export async function insertProject(projectObject, tagsObject){
    let name = projectObject.name
    let description = projectObject.description
    let status = projectObject.status
    let pictureURL = projectObject.pictureURL
    let githubURL = projectObject.githubURL
    let deploymentURL = projectObject.githubURL
    console.log(name, description, status, pictureURL, githubURL, deploymentURL)
    let insertProject = await DB.query(`
        INSERT INTO Projects VALUES
        (?, ?, ?, ?, ?, ?)`, [name, description, status, pictureURL, githubURL, deploymentURL])
    console.log(insertProject[0])
    for (let i = 0; i < tagsObject.length; i++) {
        let tagQuery = await DB.query(`
            INSERT INTO ProjectTags(name, tag)
            VALUES(?, ?)
            `, [name, tagsObject[i]])
        console.log(tagQuery[0])
    }
}


//empty for now ill just do it manually or sth. 
async function updateProject(projectObject){
    //empty function
}