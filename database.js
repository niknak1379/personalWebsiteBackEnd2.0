import mysql from "mysql2";
import dotenv from "dotenv";
import elasticClient from "./elasticSearchClient.js";

dotenv.config();
const INDEX_NAME = "projects";
const DB = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function validateLogin(user) {
  console.log("from validate", user);
  let query = await DB.query(
    `
        SELECT * FROM Users
        WHERE Users.name = ?`,
    [user]
  );
  return query[0][0];
}
export async function getRefreshToken(user) {
  let query = await DB.query(
    `
        SELECT refreshToken FROM Users
        WHERE name = ?`,
    [user]
  );
  return query[0][0];
}

export async function updateRefreshToken(user, value) {
  let query = await DB.query(
    `
        UPDATE Users
        SET refreshToken = ?
        WHERE Users.name = ?`,
    [value, user]
  );
  return query[0];
}

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
export async function getProjects(
  searchQueryStr,
  statusArr,
  tagsArray,
  entriesRequested
) {
  if (tagsArray.length == 0) {
    //console.log('hi')
  }

  let queryWithDuplicates = await DB.query(
    `
        SELECT Projects.name, description, status, pictureURL, githubURL, deploymentURL FROM Projects 
        JOIN ProjectTags ON Projects.name = ProjectTags.name
        WHERE ProjectTags.tag IN (?)
        AND Projects.name LIKE ?
        AND Projects.status IN (?)
        GROUP BY Projects.name
        HAVING COUNT(DISTINCT ProjectTags.tag) = ?
        `,
    [tagsArray, `%${searchQueryStr}%`, statusArr, tagsArray.length]
  ); //  since im joing the tags and the projects table
  //  it will return as many duplicates as there are
  //  tags -> hence the deduplication

  //handle duplicates
  let set = new Set();
  let returnList = [];
  //console.log(queryWithDuplicates[0][0]);
  for (let i = 0; i < queryWithDuplicates[0].length; i++) {
    //console.log(queryWithDuplicates[0][i].name)
    if (set.has(queryWithDuplicates[0][i].name)) {
      continue;
    }
    set.add(queryWithDuplicates[0][i].name);
    returnList.push(queryWithDuplicates[0][i]);
  }
  if (entriesRequested <= 0) {
    entriesRequested = returnList.length;
  }
  returnList.length = Math.min(returnList.length, entriesRequested);

  return returnList;
}
let res = await getProjects(
  "",
  ["In Progress", "Complete", "To Be Started"],
  ["ALL"],
  10
);
//console.log("logging test", res);
//returns all tags and their frequencies
export async function getAllTags() {
  let query = await DB.query(
    `
        SELECT tag, COUNT(*) AS Frequency
        FROM ProjectTags
        GROUP BY tag
        ORDER BY Frequency DESC;
        `,
    []
  );
  return query[0];
}
export async function getAllStatus() {
  let query = await DB.query(`
        SELECT status, COUNT(*) AS Frequency
        FROM Projects
        GROUP BY status
        `);
  return query[0];
}

export async function getProjectDetails(projectName) {
  let projectQuery = await DB.query(
    `
        SELECT longDescription, description, status, githubURL, 
        deploymentURL, pictureURL, carouselImage_1, 
        carouselImage_2, carouselImage_3, obsidianURL, creationDate, lastModified
        FROM Projects
        WHERE Projects.name = ?
        `,
    [projectName]
  );

  if (projectQuery[0][0] == null) return null;

  let tagQuery = await DB.query(
    `
        SELECT tag From ProjectTags
        WHERE name = ?
        `,
    [projectName]
  );
  let tagsArray = [];
  tagQuery[0].forEach((item) => {
    tagsArray.push(item.tag);
  });
  projectQuery[0][0].tags = tagsArray;
  console.log("from databasejs getproject normal details", projectQuery[0][0]);
  return projectQuery[0][0];
}

//getProjects("nik", "", ["PYTHON", "WEBDEV"])
export async function insertProject(projectObject, tagsObject) {
  console.log("update being called", projectObject);
  try {
    let insertProjectQuery = await DB.query(
      `
            INSERT INTO Projects (
            name,
            description,
            longDescription,
            status,
            pictureURL,
            githubURL,
            deploymentURL,
            obsidianURL,
            carouselImage_1,
            carouselImage_2,
            carouselImage_3,
            creationDate,
            lastModified
            )
            VALUES (
            ? ,
            ? ,
            ? ,
            ? ,
            ? ,
            ? ,
            ? ,
            ? ,
            ? ,
            ? ,
            ?,
            ?,
            ?
            );
        `,
      [
        projectObject.name,
        projectObject.description,
        projectObject.longDescription,
        projectObject.status,
        projectObject.pictureURL,
        projectObject.githubURL,
        projectObject.deploymentURL,
        projectObject.obsidianURL,
        projectObject.carouselImage_1,
        projectObject.carouselImage_2,
        projectObject.carouselImage_3,
        projectObject.originalName,
        projectObject.creationDate,
        projectObject.lastModified
      ]
    );
    let tagsArray = projectObject.tags.split("-");
    console.log(tagsArray);
    let updateTagsQuery = await DB.query(
      `
                INSERT INTO ProjectTags VALUES ?
            `,
      [tagsArray.map((tag) => [projectObject.name, tag])]
    );
    console.log("tag query", updateTagsQuery);
    await elasticClient.index({
      index: INDEX_NAME,
      id: projectObject.name,
      body: {
        ...projectObject,
        tags: tagsArray,
      },
      refresh: true,
    });
    return;
    //elasticSearchResync();
  } catch (error) {
    console.log(error);
    return error;
  }
}

/* req.body format when passed as the project object to the updateProject(projObject) function
        {   
            originalName: "pasa sjsj sjjs"
            name: "PASA club's Website",
            description: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.',
            londDescription: 'Website Showcasing the student organization, its members, events and projects, and resources for those interested in the club.\r\n' +
                'It is written in react and mostly uses Tailwind for styling. Does not have any app functionality or dedicated APIs as of yet, \r\n' +
                'will most likely add a custom mailing list app to it for the club to use. Mostly focused on desiging and CSS on thisi project.\r\n' +
                'Also if you are reading this please donate to the club through the venmo link it is much appreciated :)',
            githubURL: 'https://github.com/niknak1379/pasa-website',
            obsidianURL: 'https://notes.nikanostovan.dev/',
            deploymentURL: 'https://pasaatucsd.com/',
            tags: 'ALL-React-Tailwind-FrontEnd',
            carouselImage_2: "https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA club's Website/browser.avif",
            pictureURL: "https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA club's Website/browser.avif",
            carouselImage_3: "https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA club's Website/placeholder.avif",
            carouselImage_1: "https://nikan-personal-site.s3.us-east-2.amazonaws.com/persoanlWebsiteAssets/ProjectPictures/PASA club's Website/mainPage.avif"
        }
    */

export async function updateProject(projectObject) {
  console.log(
    "update being called, logging the passed in object",
    projectObject
  );
  try {
    const fields = [
      "name",
      "description",
      "longDescription",
      "status",
      "pictureURL",
      "githubURL",
      "deploymentURL",
      "obsidianURL",
      "carouselImage_1",
      "carouselImage_2",
      "carouselImage_3",
      "creationDate",
      "lastModified"
    ];

    // Build dynamic SET clause and parameters
    let setClauses = [];
    let values = [];

    for (const field of fields) {
      if (projectObject[field] !== undefined && projectObject[field] !== null) {
        setClauses.push(`${field} = ?`);
        values.push(projectObject[field]);
      }
    }

    // Add WHERE clause value
    values.push(projectObject.originalName);

    const updateSQL = `
        UPDATE Projects
        SET ${setClauses.join(", ")}
        WHERE Projects.name = ?
        `;

    const updateProjectQuery = await DB.query(updateSQL, values);
    console.log("update proj query", updateProjectQuery, updateSQL);
    let tagsArray = projectObject.tags.split("-");
    console.log(tagsArray);
    let deleteCurrentTagsQuery = await DB.query(
      `
                DELETE FROM ProjectTags
                WHERE name = ?
            `,
      [projectObject.originalName]
    );
    let updateTagsQuery = await DB.query(
      `
                INSERT INTO ProjectTags VALUES ?
            `,
      [tagsArray.map((tag) => [projectObject.name, tag])]
    );
    console.log("tag query", updateTagsQuery);

    //  the problem is that the API that returns the project object
    //  only returns the changed fields, as a result if i only call the update
    //  function the data not changed will be lost
    if (projectObject.originalName != projectObject.name) {
      let { body: currentDoc } = await elasticClient.get({
        index: INDEX_NAME,
        id: projectObject.originalName,
      });
      projectObject = {
        ...currentDoc._source,
        ...projectObject,
        tags: tagsArray,
      };
      await elasticClient.delete({
        index: INDEX_NAME,
        id: projectObject.originalName,
        refresh: true,
      });
      await elasticClient.index({
        index: INDEX_NAME,
        id: projectObject.name,
        body: {
          ...projectObject,
        },
        refresh: true,
      });
    } else {
      await elasticClient.update({
        index: INDEX_NAME,
        id: projectObject.name,
        body: {
          doc: {
            ...projectObject,
            tags: tagsArray,
          },
        },
        refresh: true,
      });
    }

    //elasticSearchResync();
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function deleteProject(projectName) {
  try {
    let query = await DB.query(
      `
            DELETE FROM Projects
            WHERE Projects.name = ?
            `,
      [projectName]
    );
    console.log(query[0]);
    await elasticClient.delete({
      index: INDEX_NAME,
      id: projectName,
    });

    await elasticClient.indices.refresh({ index: INDEX_NAME });
  } catch (error) {
    console.log("error in delete project", error);
  }
}

export async function syncAllProjectsToElasticsearch() {
  try {
    // 1. Get all projects
    const [projects] = await DB.query(`
			SELECT 
				name, description, longDescription, status, pictureURL, 
				githubURL, deploymentURL, obsidianURL, 
				carouselImage_1, carouselImage_2, carouselImage_3, creationDate, lastModified
			FROM Projects
		`);

    for (const project of projects) {
      // 2. Get tags for each project
      const [tagsRows] = await DB.query(
        `
				SELECT tag FROM ProjectTags WHERE name = ?
			`,
        [project.name]
      );

      const tagsArray = tagsRows.map((row) => row.tag);

      // 3. Index in Elasticsearch
      await elasticClient.index({
        index: INDEX_NAME,
        id: project.name,
        body: {
          ...project,
          tags: tagsArray,
        },
        refresh: true,
      });
    }

    console.log(`Synced ${projects.length} projects to Elasticsearch.`);
  } catch (err) {
    console.error("Failed to sync projects to Elasticsearch:", err);
  }
}
export async function deleteAllProjectsFromElasticsearch() {
  try {
    console.log("Deleting all existing documents...");
    await elasticClient.deleteByQuery({
      index: INDEX_NAME,
      body: {
        query: {
          match_all: {},
        },
      },
      refresh: true,
      wait_for_completion: true,
      conflicts: "proceed",
    });
    console.log("All documents deleted");
  } catch (deleteErr) {
    if (deleteErr.meta?.statusCode === 404) {
      console.log("Index was empty or doesn't exist");
    }
    console.error("Failed to delete documents:", deleteErr);
    throw deleteErr;
  }
}
async function elasticSearchResync() {
  try {
    await deleteAllProjectsFromElasticsearch();
    await syncAllProjectsToElasticsearch();
    const mapping = await elasticClient.indices.getMapping({
      index: "projects",
    });
    console.log("elastic Search Mapping:", (mapping.body.projects.mappings));
  } catch (error) {
    console.log(error);
  }
}
// elasticSearchResync();
/**
 * Converts an S3 URL to CloudFront CDN URL
 * @param {string} s3Url - The full S3 URL
 * @returns {string} The CloudFront CDN URL
 */
export function toCDN(s3Url) {
  //console.log("CDN function being called on url", s3Url);
  return s3Url.replace(process.env.S3_BUCKET_URL, process.env.CLOUDFRONT_URL);
}
